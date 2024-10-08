import { useParams } from "react-router-dom";
import "./SpotDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import * as spotsActions from '../../store/spots';
import * as reviewsActions from '../../store/reviews.js';
// import OpenModalButton from "../OpenModalButton/OpenModalButton";
// import DeleteSpotModal from '../DeleteSpotModal/DeleteSpotModal';
import Reviews from "../Reviews/Reviews";
import { FiStar } from "react-icons/fi";

const SpotDetails = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    // const navigate = useNavigate();
    const user = useSelector((state) => { return state.session.user });
    const spots = useSelector((state) => { return state.spots.spots })
    const avg = useSelector((state) => { return state.reviews.avgStars })
    const numOfRev = useSelector((state) => { return state.reviews.numOfRev }) //instead state.reviews.length?
    // console.log("🚀 ~ SpotDetails ~ spots:", spots)
    const noImgSrc = 'https://media.istockphoto.com/id/931643150/vector/picture-icon.jpg?s=612x612&w=0&k=20&c=St-gpRn58eIa8EDAHpn_yO4CZZAnGD6wKpln9l3Z3Ok=';

    let spot;
    if (spots) {
        spot = spots.find((spot) => {
            return spot.id === +spotId
        })
            // console.log("🚀 ~ SpotDetails ~ spot:", spot)
    }

    useEffect(() => {
        // dispatch(spotsActions.getOneSpot(spotId))
        dispatch(spotsActions.getAllThunk());
        dispatch(reviewsActions.getAvgStars(spotId));
    }, [dispatch, spotId])
    // const spot = useSelector((state) => { return state.spots.oneSpot });
    // state.reviews.reviews? i dont want it to be too broad but it might need to be
    // const correctUser = (user, spot) => {
    //     if (!user) { return false }
    //     if (user.id === spot.ownerId) {
    //         return true
    //     } else {
    //         return false
    //     }
    // }
    if (!spot) return; // if i move this higher it breaks why?

    // const clickNav = async (id) => {
    //     // console.log('sendiung click nav with this id',id)
    //     const data = await dispatch(spotsActions.getOneSpot(id));
    //     console.log('this is data in click nav in spotdetails',data);
    //     navigate('/edit-spot');
    //     return data;
    // }

    return (
        <div className="details-body">
            <div className="header-container-spotd">
                <h1 className="spotname-header">{spot.name}</h1>
                <p>Location: {spot.city}, {spot.state}, {spot.country}</p>
            </div>
            <div className="one-spot">
                <div className="image-container">
                    {/* {console.log(spot)} */}
                    {/* {spot.SpotImages.length === 1 && <img src={spot.SpotImages[0].url}/>} */}
                    {spot.SpotImages.length >= 1 ? <img src={spot.SpotImages[0].url} className="spot-detail-img one" /> : <img src={noImgSrc} className="spot-detail-img one"/>}
                    {spot.SpotImages.length >= 2 ? <img src={spot.SpotImages[1].url} className="spot-detail-img two" /> : <img src={noImgSrc} className="spot-detail-img two"/>}
                    {spot.SpotImages.length >= 3 ? <img src={spot.SpotImages[2].url} className="spot-detail-img three" /> : <img src={noImgSrc} className="spot-detail-img three"/>}
                    {spot.SpotImages.length >= 4 ? <img src={spot.SpotImages[3].url} className="spot-detail-img four" /> : <img src={noImgSrc} className="spot-detail-img four"/>}
                    {spot.SpotImages.length === 5 ? <img src={spot.SpotImages[4].url} className="spot-detail-img five" /> : <img src={noImgSrc} className="spot-detail-img five"/>}
                </div>
                <div className="middle-sect">
                    <div className="details-box">
                        {spot.User && <p>Hosted by: {spot.User.firstName}, {spot.User.lastName}</p>}
                        <p>description: {spot.description}</p>
                    </div>
                    <div className="reserve-box" >
                        <div className="reserve-text">
                            <p style={{marginLeft: '10px'}}>{spot.price.includes('$') ? spot.price : '$' + spot.price } night</p>
                            <div className="right-side-reserve">
                                <FiStar />
                                <p style={{ margin: '0px' }}>{isNaN(avg) ? 'New' : numOfRev > 1 ? `${avg} · ${numOfRev} Reviews`: `${avg} · ${numOfRev} Review`}</p>
                            </div>
                        </div>
                        <button onClick={() => { alert('feature coming soon') }} className="reserve-button">Reserve</button>
                    </div>
                </div>
            </div>
            {/* {correctUser(user, spot) && <button onClick={()=>clickNav(spot.id)}> Update </button>}
            {correctUser(user, spot) && <OpenModalButton
                buttonText='delete spot'
                modalComponent={<DeleteSpotModal spot={spot} />}
            />} */}

            <div className="reviews-box">
                <Reviews props={{ spot, user }} />
            </div>
        </div>
    )
}
export default SpotDetails;
