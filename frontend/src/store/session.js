import { csrfFetch } from './csrf';

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
    return {
        type: SET_USER,
        payload: user
    };
};

const removeUser = () => {
    return {
        type: REMOVE_USER
    };
};

export const login = (user) => async (dispatch) => {
    const { credential, password } = user;
    const response = await csrfFetch("/api/session", {
        method: "POST",
        body: JSON.stringify({
            credential,
            password
        })
    });
    if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data.user));
        return response;
    } else {
        const errors = await response.json()
        return errors;
    }
};

export const signUp = user => async dispatch => {
    const { username, firstName, lastName, password, email } = user;
    const res = await csrfFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, firstName, lastName, email, password })
    });
    const data = await res.json();
    dispatch(setUser(data.user))
    return res;

}

export const restoreUser = () => async (dispatch) => {
    const res = await csrfFetch('/api/session');

    if (res.ok) {
        const data = await res.json();
        dispatch(setUser(data.user))
        return data
    }
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
        method: 'DELETE'
    });
    dispatch(removeUser());
    return response;
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        case REMOVE_USER:
            return { ...state, user: null };
        default:
            return state;
    }
};

export default sessionReducer;
