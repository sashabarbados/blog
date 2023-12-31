import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import './sign-in-page.scss';

import { loginUser } from '../../api/user-api';
import { logIn, setUser } from '../../store/userSlice';

export default function SignInPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [responseError, setRepsonseError] = useState(null);
  const { user } = useSelector((state) => state.userSlice);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
  });

  const onSubmitLogin = async (data) => {
    setIsLoading(true);
    try {
      const fetchLogin = await loginUser({ user: data });
      const { user: newUser } = fetchLogin;

      if (newUser) {
        const mergedUser = {
          ...newUser,
          bio: user.bio,
          image: user.image,
        };

        localStorage.setItem('currentUser', JSON.stringify(mergedUser.token));
        dispatch(setUser(mergedUser));
        dispatch(logIn(true));
        navigate('/');
      }
    } catch (error) {
      setRepsonseError(`${error.message} - Вы ввели неверные данные, попробуйте снова`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateErr = (inputType) => (
    <div style={{ color: 'red' }}>{errors?.[inputType] && <p>{errors?.[inputType]?.message || 'Error!'}</p>}</div>
  );

  const spin = <div className="spin-container">{isLoading && <Spin />}</div>;

  if (responseError) {
    return (
      <div>
        <Alert message={responseError} type="error" />
      </div>
    );
  }

  return (
    <>
      {spin}
      <div className="blog__form form">
        <h2 className="form__title">Sign In</h2>
        <form className="form__form" onSubmit={handleSubmit(onSubmitLogin)}>
          <label className="form__label">
            Email address
            <input
              {...register('email', {
                required: 'Поле обязательно к заполнению',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Введите корректный email-адрес',
                },
              })}
              className={`form__input ${errors?.email ? ' error' : ''}`}
              type="email"
              placeholder="Email address"
            />
            {validateErr('email')}
          </label>
          <label className="form__label last-label">
            Password
            <input
              {...register('password', {
                required: 'Поле обязательно к заполнению',
                minLength: {
                  value: 6,
                  message: 'Должно быть минимум 6 символов',
                },
                maxLength: {
                  value: 40,
                  message: 'Должно быть максимум 40 символов',
                },
              })}
              className={`form__input ${errors?.password ? ' error' : ''}`}
              type="password"
              placeholder="Password"
            />
            {validateErr('password')}
          </label>
          <input className="form__button" type="submit" value={isLoading ? 'Loading' : 'Login'} disabled={isLoading} />
        </form>
        <div className="form__sign-in">
          Don’t have an account?
          <Link to="/sign-up">
            <span> Sign Up.</span>
          </Link>
        </div>
      </div>
    </>
  );
}
