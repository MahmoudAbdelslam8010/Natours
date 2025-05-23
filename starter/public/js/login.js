import axios from 'axios'
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            showAlert('success','logged in succssefully')
            setTimeout(() => {
                location.assign('/')
            },1500)
        }
    } catch (err) {
        showAlert('error',err.response.data.message);
    }
};
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status === 'success')) location.assign('/');
  } catch (err) {
      console.log(err)
    showAlert('error', 'Error logging out! Try again.');
  }
};
