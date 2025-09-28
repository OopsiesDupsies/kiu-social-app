import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { RegisterData } from '../types'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Calendar, GraduationCap } from 'lucide-react'

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<RegisterData & { confirmPassword: string }>()

  const password = watch('password')

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      toast.success('Registration successful!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join KIU Social
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with your fellow KIU students
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      maxLength: {
                        value: 50,
                        message: 'First name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className="input-field pl-10"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      maxLength: {
                        value: 50,
                        message: 'Last name must be less than 50 characters'
                      }
                    })}
                    type="text"
                    className="input-field pl-10"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                KIU Email
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
                      message: 'Must be a valid KIU email (@kiu.edu.ge)'
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    maxLength: {
                      value: 30,
                      message: 'Username must be less than 30 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="johndoe"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                Major
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('major', {
                    required: 'Major is required'
                  })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Computer Science"
                />
              </div>
              {errors.major && (
                <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('dateOfBirth', {
                      required: 'Date of birth is required'
                    })}
                    type="date"
                    className="input-field pl-10"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">
                  Start Year
                </label>
                <input
                  {...register('startYear', {
                    required: 'Start year is required',
                    valueAsNumber: true,
                    min: {
                      value: 2020,
                      message: 'Start year must be 2020 or later'
                    },
                    max: {
                      value: new Date().getFullYear() + 5,
                      message: 'Invalid start year'
                    }
                  })}
                  type="number"
                  min="2020"
                  max={new Date().getFullYear() + 5}
                  className="input-field"
                  placeholder="2023"
                />
                {errors.startYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.startYear.message}</p>
                )}
              </div>
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  type="password"
                  className="input-field pl-10"
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN (4 digits for quick login)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('pin', {
                    required: 'PIN is required',
                    pattern: {
                      value: /^\d{4}$/,
                      message: 'PIN must be exactly 4 digits'
                    }
                  })}
                  type={showPin ? 'text' : 'password'}
                  maxLength={4}
                  className="input-field pl-10 pr-10 text-center text-2xl tracking-widest"
                  placeholder="0000"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.pin && (
                <p className="mt-1 text-sm text-red-600">{errors.pin.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-kiu-600 hover:bg-kiu-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kiu-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-kiu-600 hover:text-kiu-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
