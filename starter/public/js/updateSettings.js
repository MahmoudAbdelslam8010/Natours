import axios from 'axios'
import { showAlert } from './alert';

export const update = async (data,type) => {
    try {
        const url  = type ==="password" ?  '/api/v1/users/updatePassword' : ' /api/v1/users/updateMe'
        const res = await axios({
            method: 'PATCH',
            url:url,
            data: data
        })
        if (res.data.status === 'success') {
            showAlert('success',`${type.toUpperCase()} is updated successfully`)
        }
    } catch (err) {
        showAlert('error',err.response.data.message);
    }
}
