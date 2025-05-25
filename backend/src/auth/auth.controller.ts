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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
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
    const redirectUri = user?.state || 'http://localhost:3000/dashboard';
    // Find or create user in DB
    let dbUser = await this.authService.findUserByEmail(user.email);
    if (!dbUser) {
      dbUser = await this.authService.createUserWithPassword(
        user.email,
        '', // No password for Google users
        user.name,
        'google', // Set provider field
      );
    } else if (!dbUser.provider) {
      // If user exists but provider is not set, update it
      await this.authService.updateUserProvider(dbUser.email, 'google');
      dbUser.provider = 'google';
    }
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
    const user = await this.authService.findUserByEmail(email);
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

  @Post('dev-register')
  async devRegister(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    if (process.env.NODE_ENV !== 'development') {
      throw new UnauthorizedException('Not allowed');
    }
    const { email, password, name } = body;
    const passwordHash = await (await import('bcryptjs')).hash(password, 10);
    let user = await this.authService.findUserByEmail(email);
    if (!user) {
      user = await this.authService.createUserWithPassword(
        email,
        passwordHash,
        name,
      );
    } else {
      // Update password if user exists
      user = await this.authService.updateUserPassword(email, passwordHash);
    }
    return { success: true, user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    // req.user is set by JwtStrategy
    const user = await this.authService.findUserByEmail(req.user.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
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
