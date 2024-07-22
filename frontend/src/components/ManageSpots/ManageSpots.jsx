import { useDispatch, useSelector } from "react-redux";
import * as spotsActions from '../../store/spots';
import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import DeleteSpotModal from '../DeleteSpotModal/DeleteSpotModal';
import './ManageSpots.css';

const ManageSpots = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => { return state.session.user });

    useEffect(() => {
        dispatch(spotsActions.getUserSpots(user.id))
    }, [dispatch, user.id]);

    const spots = useSelector((state => { return state.spots.spots }))
    if (!spots) return;
    // console.log('this is spots in the manage spots page',spots)

    const send = (id) => {
        navigate(`/spots/${id}`)
    };

    const correctUser = (user, spot) => {
        if (user.id === spot.ownerId) {
            return true
        } else {
            return false
        }
    };
    const clickNav = async (id) => {
        // console.log('sendiung click nav with this id',id)
        const data = await dispatch(spotsActions.getOneSpot(id));
        console.log(data);
        navigate('/edit-spot');
        return data;
    }
    // console.log('this is spots',spots)

    return (
        <div className="super-big-box">
            <h1>Manage Spots</h1>
            <div id='manage-container'>
                {spots.length === 0 && <NavLink to='/newSpot'>Create a New Spot</NavLink>}
                {spots.map((spot) => {
                    // console.log(spot)
                    let id = spot.id
                    let avg = spot.averageRating;
                    let imgs = spot.SpotImages;
                    // console.log("🚀 ~ {spots.map ~ imgs:", imgs)
                    if (avg && avg.toString().length === 1) { avg = `${avg}.0` }
                    return (
                        <div key={id} className="manage-spots-container">
                            <div className='spot-card tooltip' onClick={() => { send(id) }}>
                                <span className="tooltiptext">{spot.name}</span>
                                <img className="spot-img" src={imgs ? imgs[0].url : null} alt='' />
                                <div className="card-text-box">
                                    <div className="left-text">
                                        <p className="card-text">{spot.city}, {spot.state}</p>
                                        <p className="card-text">{spot.price} night</p>
                                    </div>
                                    <div className="right-text">
                                        <FiStar />
                                        <p id='rating'>{avg ? avg : 'New'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="buttons-manage-spot">
                                {correctUser(user, spot) && <button onClick={()=>{clickNav(spot.id)}}> Update </button>}
                                {correctUser(user, spot) && <OpenModalButton
                                    buttonText='delete spot'
                                    modalComponent={<DeleteSpotModal spot={spot} />}
                                />}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
export default ManageSpots;