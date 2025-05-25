import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Body,
  Post,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '@/prisma.service';
import { encrypt } from '@/lib/utils/crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // No-op: handled by Passport
  }

  @Get(['google/callback', 'callback/google'])
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // User info is attached to req.user by GoogleStrategy
    const user = req.user;
    if (!user.refreshToken) {
      throw new UnauthorizedException(
        'Google did not return a refresh token. Please remove this app from your Google account permissions and sign in again.',
      );
    }
    const redirectUri = user?.state || 'http://localhost:3000/dashboard';
    // Find or create user in DB
    let dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!dbUser) {
      dbUser = await this.prisma.user.create({
        data: {
          email: user.email,
          passwordHash: '',
          name: user.name,
          provider: 'google',
          refreshToken: user.refreshToken
            ? encrypt(user.refreshToken)
            : undefined, // Only store if present
        },
      });
    }
    if (!dbUser.provider) {
      // If user exists but provider is not set, update it
      dbUser.provider = 'google';
    }
    if (user.refreshToken) {
      dbUser.refreshToken = encrypt(user.refreshToken);
    }
    await this.prisma.user.update({
      where: { email: dbUser.email },
      data: dbUser,
    });

    // Optionally log a warning if refreshToken is missing

    // Issue JWT with user.email as sub
    const payload = {
      sub: dbUser.email,
      email: dbUser.email,
      name: dbUser.name,
      picture: dbUser.image,
    };
    const token = this.jwtService.sign(payload);
    // Redirect to frontend with token as query param
    const url = new URL(redirectUri);
    url.searchParams.set('token', token);
    return res.redirect(url.toString());
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Compare password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Issue JWT
    const payload = { sub: user.email, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      refreshToken: '', // Optional: implement refresh tokens if needed
      user: {
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    // req.user is set by JwtStrategy
    const user = await this.prisma.user.findUnique({
      where: { email: req.user.email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.provider !== 'jwt') {
      this.authService.validateOAuthLogin(req.user, user.provider); // No-op for JWT auth
    }
    return {
      accessToken: req.headers['authorization']?.replace('Bearer ', ''),
      refreshToken: '',
      user: {
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  }
}
