import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as spotsActions from '../../store/spots.js';
import './EditSpot.css';
import { useNavigate, useParams } from "react-router-dom";

const EditSpot = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { spotId } = useParams();
    const spot = useSelector((state) => { return state.spots.oneSpot });
    const user = useSelector((state) => { return state.session.user });
    // console.log(spot)

    const [address, setAddress] = useState(spot?.address);
    const [city, setCity] = useState(spot?.city);
    const [state, setState] = useState(spot?.state);
    const [country, setCountry] = useState(spot?.country);
    const [lat, setLat] = useState(spot?.lat);
    const [lng, setLng] = useState(spot?.lng);
    const [name, setName] = useState(spot?.name);
    const [description, setDescription] = useState(spot?.description);
    const [price, setPrice] = useState(spot?.price);
    const [url, setUrl] = useState(spot?.SpotImages[0].url);
    const [errors, setErrors] = useState({});
    const [count, setCount] = useState(0);

    const setInfo = () => {
        setAddress(spot?.address || '')
        setCity(spot?.city)
        setState(spot?.state)
        setCountry(spot?.country)
        setLat(spot?.lat)
        setLng(spot?.lng)
        setName(spot?.name)
        setDescription(spot?.description)
        let newPrice;
        if (spot?.price) {
            newPrice = spot.price.slice(1);
        }
        setPrice(newPrice)
        setUrl(spot?.SpotImages[0].url)
    };

    useEffect(() => {
        dispatch(spotsActions.getOneSpot(spotId));
    }, [dispatch, spotId, count]);
    if(spot && count < 2){
        setCount(count + 1);
        setInfo();
    }


    const onSubmit = async (e) => {
        e.preventDefault();
        const update = {
            id: spot.id,
            address, city, state, country,
            lat, lng, name, description, price,
            ownerId: spot.ownerId
        };
        const res = await dispatch(spotsActions.editSpot(update, user))
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            })
        if (res?.id) {
            navigate(`/spots/${res.id}`);
        }
    };

    if (!spot) return

    return (
        <div className="biggest">
            <div className="big-box">
                <div className="head-box">
                    <h1 className="headers">Update your Spot</h1>
                    <h3 className="headers">Where&apos;s your place located?</h3>
                    <p className="headers">Guests will only get your exact address once they booked a
                        reservation.</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="first-section">
                        <label>
                            Country
                            <input
                                className="input"
                                type='text'
                                value={country}
                                onChange={(e) => { setCountry(e.target.value) }}
                                placeholder='Country' />
                        </label>
                        {errors.country && <p className="errors">{errors.country}</p>}
                        <label>
                            Street Address
                            <input
                                className="input"
                                type='text'
                                value={address}
                                onChange={(e) => { setAddress(e.target.value) }}
                                placeholder='Address' />
                        </label>
                        {errors.address && <p className='errors'>{errors.address}</p>}
                        <div id='cit-stat2'>
                            <div className="half">
                                <label>
                                    City
                                    <input
                                        id='city2'
                                        className="input"
                                        type='text'
                                        value={city}
                                        onChange={(e) => { setCity(e.target.value) }}
                                        placeholder='City' />
                                </label>
                            </div>
                            <div className="half right">
                                <label>
                                    State
                                    <input
                                        id='state2'
                                        className="input"
                                        type='text'
                                        value={state}
                                        onChange={(e) => { setState(e.target.value) }}
                                        placeholder='STATE' />
                                </label>
                            </div>
                        </div>
                        {errors.city && <p className='errors'>{errors.city}</p>}
                        {errors.state && <p className='errors'>{errors.state}</p>}
                        <div id='lat-lng2'>
                            <div className="half">
                                <label>
                                    Latitude
                                    <input
                                        id='latitude2'
                                        className="input"
                                        type='number'
                                        value={lat}
                                        onChange={(e) => { setLat(e.target.value) }}
                                        placeholder='Latitude' />
                                </label>
                            </div>
                            <div className="half" id='div-longitude2'>
                                <label>
                                    Longitude
                                    <input
                                        id='longitude2'
                                        className="input"
                                        type='number'
                                        value={lng}
                                        onChange={(e) => { setLng(e.target.value) }}
                                        placeholder='Longitude' />
                                </label>
                            </div>
                        </div>
                        {errors.lat && <p className='errors'>{errors.lat}</p>}
                        {errors.lng && <p className='errors'>{errors.lng}</p>}
                    </div>
                    <div className="second-sect">
                        <h3>Describe your place to guests</h3>
                        <p>Mention the best features of your space, any special amentities like
                            fast wif or parking, and what you love about the neighborhood.</p>
                        <label>
                            <textarea
                                type='text'
                                value={description}
                                onChange={(e) => { setDescription(e.target.value) }}
                                placeholder='Please write at least 30 characters' />
                        </label>
                        {errors.description && <p className='errors'>{errors.description}</p>}
                    </div>
                    <div className="third-sect">
                        <h3>Create a title for your spot</h3>
                        <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.
                        </p>
                        <label>
                            <input
                                className="input"
                                type='text'
                                value={name}
                                onChange={(e) => { setName(e.target.value) }}
                                placeholder='Name of your spot' />
                        </label>
                        {errors.name && <p className='errors'>{errors.name}</p>}
                    </div>
                    <div className="fourth-sect">
                        <h3>Set a base price for your spot</h3>
                        <p>Competitive pricing can help your listing stand out and rank higher
                            in search results.</p>
                        <label>
                            <input
                                className="input"
                                type='number'
                                value={price}
                                onChange={(e) => { setPrice(e.target.value) }}
                                placeholder='Price per night (USD)' />
                        </label>
                        {errors.price && <p className='errors'>{errors.price}</p>}
                    </div>
                    <div className="fifth-sect">
                        <h3>Liven up your spot with photos</h3>
                        <p>Submit a link to at least one photo to publish your spot.</p>
                        <input
                            className="input"
                            type='text'
                            value={url}
                            onChange={(e) => { setUrl(e.target.value) }}
                            placeholder="Preview Image URL" />
                        <input className="input" type="text" placeholder="Image URL" />
                        <input className="input" type="text" placeholder="Image URL" />
                        <input className="input" type="text" placeholder="Image URL" />
                        <input className="input" type="text" placeholder="Image URL" />
                    </div>
                    <button type='submit' className="update-spot-button">Update your Spot</button>
                </form>
            </div>
        </div>
    )
}


export default EditSpot;
