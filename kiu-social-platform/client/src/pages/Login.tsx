import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { LoginCredentials } from '../types'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isQuickLogin, setIsQuickLogin] = useState(false)
  const { login, quickLogin } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginCredentials & { pin: string }>()

  const onSubmit = async (data: LoginCredentials | { pin: string }) => {
    try {
      if (isQuickLogin) {
        await quickLogin({ pin: (data as { pin: string }).pin })
      } else {
        await login(data as LoginCredentials)
      }
      toast.success('Login successful!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isQuickLogin ? 'Quick Login' : 'Sign in to KIU Social'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isQuickLogin ? 'Enter your PIN to continue' : 'Welcome back to the KIU community'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {!isQuickLogin && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@kiu\.edu\.ge$/,
                          message: 'Must be a valid KIU email'
                        }
                      })}
                      type="email"
                      className="input-field pl-10"
                      placeholder="your.name@kiu.edu.ge"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-10 pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </>
            )}

            {isQuickLogin && (
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                  PIN
                </label>
                <input
                  {...register('pin', {
                    required: 'PIN is required',
                    pattern: {
                      value: /^\d{4}$/,
                      message: 'PIN must be exactly 4 digits'
                    }
                  })}
                  type="password"
                  maxLength={4}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="0000"
                />
                {errors.pin && (
                  <p className="mt-1 text-sm text-red-600">{errors.pin.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-kiu-600 hover:bg-kiu-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kiu-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : (isQuickLogin ? 'Quick Login' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsQuickLogin(!isQuickLogin)
                reset()
              }}
              className="text-kiu-600 hover:text-kiu-500 text-sm font-medium"
            >
              {isQuickLogin ? 'Use email and password instead' : 'Quick login with PIN'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-kiu-600 hover:text-kiu-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
