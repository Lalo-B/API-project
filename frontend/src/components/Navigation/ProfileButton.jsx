import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FiUser } from 'react-icons/fi';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import { NavLink, useNavigate } from 'react-router-dom';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate('/');
  };

  const ulClassName = (showMenu ? "" : "hidden");

  return (
    <>
      <button onClick={toggleMenu} className='profile-button'>
        <FiUser style={{ padding: '0px', margin: '0px' }} />
      </button>
      <div  className={`${ulClassName} profile-dropdown`} ref={ulRef}>
        <ul className='no-bullets drop-list' ref={ulRef}>
          {user ? (
            <div>
              <li>Hello, {user.firstName}</li>
              <li>{user.username}</li>
              <li>{user.email}</li>
              <NavLink to='/manage' style={{ textDecoration: 'none' }}>Manage Spots</NavLink>
              <li>
                <button onClick={logout} className='logout-button'style={{cursor: 'pointer'}}>Log Out</button>
              </li>
            </div>
          ) : (
            <div>
              <OpenModalMenuItem
                itemText="Sign Up"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
              <OpenModalMenuItem
                itemText="Log In"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </div>
          )}
        </ul>
      </div>
    </>
  );
}

export default ProfileButton;
