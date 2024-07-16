const express = require('express');
const { Sequelize } = require('sequelize');
const { setTokenCookie, restoreUser, requireAuth, authErrorCatcher, doesOwnSpot } = require('../../utils/auth');
const { Spot, SpotImage, User, Booking, Review } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


router.use(handleValidationErrors);
router.delete('/', doesOwnSpot);
router.put('/', doesOwnSpot);




//get all reviews by a spots id
router.get('/:spotId/reviews', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) {
        res.status(404);
        return res.json({ message: "Spot could not be found" });
    };

    const reviews = await Review.findAll({
        where: {
            id: req.params.spotId
        }
    });
    // if (reviews.length === 0) {
    //     res.status(404);
    //     return res.json({ message: "Spot couldn't be found" });
    // };
    res.status(200);
    return res.json(reviews);
});


//Create a Booking from a Spot based on the Spot's id
router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    let currSpot;
    const currDate = new Date();
    if (req.params.spotId) {
        currSpot = await Spot.findByPk(req.params.spotId);
        if (!currSpot) {
            res.status(404);
            res.body = { message: "Spot couldn't be found" };
            return res.json(res.body);
        };
    };

    const { user } = req;
    const { startDate, endDate } = req.body;
    const spotBookings = await Booking.findAll({
        where: {
            spotId: currSpot.id
        }
    });
    if (currSpot.ownerId === user.id) {
        res.status(403);
        return res.json({ message: "Forbidden" })
    };


    if (spotBookings) {
        spotBookings.forEach((booking) => {
            let start = booking.startDate;
            let end = booking.endDate;
            let actStart = new Date(startDate);
            let actEnd = new Date(endDate);
            if (actEnd <= currDate) {
                res.status(403)
                return res.json({ message: "Cannot book dates in the past" });
            };
            if (actEnd < currDate || actStart < currDate) {
                res.status(400);
                res.body = {
                    "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                    "errors": {
                        "startDate": "startDate cannot be in the past",
                        "endDate": "endDate cannot be on or before startDate"
                    }
                };
                return res.json(res.body);
            };
            if (actStart <= end && actStart >= start) {
                res.status(403);
                res.body = {
                    "message": "Sorry, this spot is already booked for the specified dates",
                    "errors": {
                        "startDate": "Start date conflicts with an existing booking",
                        "endDate": "End date conflicts with an existing booking"
                    }
                };
                return res.json(res.body);
            };
            if (actEnd <= end && actEnd >= start) {
                res.status(403);
                res.body = {
                    "message": "Sorry, this spot is already booked for the specified dates",
                    "errors": {
                        "startDate": "Start date conflicts with an existing booking",
                        "endDate": "End date conflicts with an existing booking"
                    }
                };
                return res.json(res.body);
            };
            if (actStart >= actEnd) {
                res.status(400);
                return res.json({
                    "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                    "errors": {
                        "endDate": "endDate cannot be on or before startDate"
                    }
                });
            };
            if (actStart <= start && actEnd >= end) {
                res.status(403)
                return res.json({ message: "Forbidden" });
            };
        });
    };


    if (startDate && endDate) {
        const newBooking = await Booking.create({
            spotId: +req.params.spotId,
            userId: user.id,
            startDate, endDate
        });
        res.body = newBooking;
        return res.json(res.body);
    } else {
        res.status(400);
        res.body = {
            "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
            "errors": {
                "startDate": "startDate cannot be in the past",
                "endDate": "endDate cannot be on or before startDate"
            }
        };
        return res.json(res.body)
    };
});


//Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    const spots = await Spot.findAll({
        where: {
            ownerId: user.id
        },
    });
    return res.json(spots);
});

//Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const { user } = req;
    const foundSpot = await Spot.findByPk(req.params.spotId);
    if (foundSpot === null) {
        res.status(404);
        res.body = { message: "Spot couldn't be found" }
        return res.json(res.body);
    };

    // return res.json(req.params.spotId);
    const alreadyReview = await Review.findAll({
        where: {
            spotId: +req.params.spotId,
            userId: user.id
        }
    });
    // return res.json(alreadyReview);
    if (alreadyReview.length > 0) {
        res.status(500);
        res.body = { message: "User already has a review for this spot" };
        return res.json(res.body);
    };

    let newR;
    if (review && stars) {
        newR = await Review.create({
            spotId: req.params.spotId, userId: req.user.id, review, stars
        });
    } else {
        res.status(400);
        res.body = {
            "message": "Bad Request",
            "errors": {
                "review": "Review text is required",
                "stars": "Stars must be an integer from 1 to 5",
            }
        }
        return res.json(res.body);
    };
    res.status(201);
    // res.body = {
    //     review, stars
    // };
    return res.json(newR);
});


//Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const { user } = req;
    const spot = await Spot.findAll({
        where: {
            id: req.params.spotId
        },
        include: [{
            model: Booking,
            through: Booking.id
        }, {
            model: User,
            through: User.id
        }]
    });

    if (spot.length === 0) {
        res.status(404)
        return res.json({ message: 'Spot couldn\'t be found' })
    };

    Bookings = [];
    if (user.id === spot[0].ownerId) {
        spot.forEach(booking => {
            let actualB = booking.Bookings;
            let actualU = booking.User;
            const { id, spotId, userId, startDate, endDate, createdAt, updatedAt } = actualB[0];
            Bookings.push({
                User: { actualU },
                id, spotId, userId, startDate, endDate, createdAt, updatedAt
            });
        });
    } else {
        spot.forEach(booking => {
            const { spotId, startDate, endDate } = booking.Bookings[0];
            // console.log(booking.Bookings)
            Bookings.push({ spotId, startDate, endDate });
        });
    };
    res.body = { Bookings };

    return res.json(res.body);
});

// add an image to a spot based on the spots id
router.post('/:spotId/images', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    if (spot === null) {
        res.status(404);
        res.body = { message: "Spot couldn't be found" }
        return res.json(res.body)
    };
    if (req.user.id !== spot.ownerId) {
        res.status(403);
        res.body = { message: "Forbidden" };
        return res.json(res.body);
    };
    const newImg = req.body.url;
    const img = await SpotImage.create({
        spotId: req.params.spotId,
        url: newImg,
        preview: true
    });

    // res.body = {
    //     id: img.id,
    //     url: img.url,
    //     preview: img.preview
    // };
    return res.json(img);
});


// get details for a spot from an id
router.get('/:spotId', requireAuth, async (req, res) => {
    if (req.params.spotId === undefined) {
        res.status(404);
        return res.json({
            message: "Spot couldn't be found"
        })
    };

    const spotInfo = await Spot.findAll({
        where: {
            id: req.params.spotId
        },
        include: [{
            model: SpotImage,
            through: Spot.id,
            attributes: ['id', 'url', 'preview']
        },
        {
            model: User,
            through: User.id,
            // as: 'Owner',
            attributes: ['id', 'firstName', 'lastName']
        }]
    })
    if (spotInfo.length === 0) {
        res.status(404);
        return res.json({
            message: "Spot couldn't be found"
        })
    };
    res.body = {
        spotInfo: spotInfo,
        SpotImages: SpotImage,
        Owner: User,
    }
    return res.json(res.body);
});


// create new spot
router.post('/', requireAuth, async (req, res) => {
    const { user } = req;
    let spotObj = {
        ownerId,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
    } = req.body;
    spotObj.ownerId = user.id;

    if (Object.keys(spotObj).length === 0) {
        res.status(400);
        res.body = {
            "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
            "errors": {
                "address": "Street address is required",
                "city": "City is required",
                "state": "State is required",
                "country": "Country is required",
                "lat": "Latitude must be within -90 and 90",
                "lng": "Longitude must be within -180 and 180",
                "name": "Name must be less than 50 characters",
                "description": "Description is required",
                "price": "Price per day must be a positive number"
            }
        };
        return res.json(res.body);
    };

    for (const key in spotObj) {
        if (spotObj[key] === undefined || spotObj[key] === '') {
            res.status(400);
            res.body = {
                "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                "errors": {
                    "address": "Street address is required",
                    "city": "City is required",
                    "state": "State is required",
                    "country": "Country is required",
                    "lat": "Latitude must be within -90 and 90",
                    "lng": "Longitude must be within -180 and 180",
                    "name": "Name must be less than 50 characters",
                    "description": "Description is required",
                    "price": "Price per day must be a positive number"
                }
            };
            return res.json(res.body);
        };
    };

    let newSpot = await Spot.create({
        ownerId: user.id,
        address: spotObj.address,
        city: spotObj.city,
        state: spotObj.state,
        country: spotObj.country,
        lat: spotObj.lat,
        lng: spotObj.lng,
        name: spotObj.name,
        description: spotObj.description,
        price: '$' + spotObj.price
    });


    res.status(201);
    return res.json(newSpot);
});

//delete spot by id
router.delete('/:spotId', requireAuth, async (req, res) => {

    const thisOne = await Spot.findByPk(req.params.spotId);
    if (!thisOne) {
        res.status(404);
        res.body = { message: 'Spot couldn\'t be found' };
        return res.json(res.body);
    } else if (req.user.id !== thisOne.ownerId) {
        res.status(403);
        return res.json({ message: "Forbidden" })
    } else {
        await thisOne.destroy();
        res.body = { message: "successfully deleted" }
        return res.json(res.body);
    };

});

// update a spot
router.put('/:spotId', requireAuth, async (req, res) => {
    let spot;
    console.log('this is the params in back end',req.params.spotId)
    if (req.params.spotId) {
        spot = await Spot.findByPk(req.params.spotId);
    };

    console.log('this is spot in the back end',spot)

    const updateObj = {
        address, city, state, country, lat,
        lng, name, description, price
    } = req.body;

    if (Object.keys(updateObj).length === 0) {
        res.status(400);
        res.body = {
            "message": "Bad Request",
            "errors": {
                "address": "Street address is required",
                "city": "City is required",
                "state": "State is required",
                "country": "Country is required",
                "lat": "Latitude must be within -90 and 90",
                "lng": "Longitude must be within -180 and 180",
                "name": "Name must be less than 50 characters",
                "description": "Description is required",
                "price": "Price per day must be a positive number"
            }
        };
        return res.json(res.body);
    };

    for (let key in updateObj) {
        if (!updateObj[key]) {
            res.status(400);
            res.body = {
                "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                "errors": {
                    "address": "Street address is required",
                    "city": "City is required",
                    "state": "State is required",
                    "country": "Country is required",
                    "lat": "Latitude must be within -90 and 90",
                    "lng": "Longitude must be within -180 and 180",
                    "name": "Name must be less than 50 characters",
                    "description": "Description is required",
                    "price": "Price per day must be a positive number"
                }
            };
            return res.json(res.body);
        }
    };

    if (!spot) {
        res.status(404);
        res.body = { message: "Spot couldn't be found" };
        return res.json(res.body);
    } else if (req.user.id !== spot.ownerId) {
        res.status(403);
        return res.json({ message: "Forbidden" });
    } else {
        await spot.set({
            address: updateObj.address,
            city: updateObj.city,
            state: updateObj.state,
            country: updateObj.country,
            lat: updateObj.lat,
            lng: updateObj.lng,
            name: updateObj.name,
            description: updateObj.description,
            price: `$${updateObj.price}`
        });
        await spot.save();
        res.body = updateObj;
        return res.json(res.body);
    };
});




// find all spots with query parameters

router.get("/", async (req, res) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    let pagination = {};
    let where = {};
    let errors = {};


    if (!page) {
        page = 1;
    } else if (isNaN(page)) {
        errors.page = "Page must be a number";
    }

    if (!size) {
        size = 20;
    } else if (isNaN(size)) {
        errors.size = "Size must be a number";
    }

    if (page <= 0 || page > 10) errors.page = "Page must be greater than or equal to 1 and less than or equal to 10";
    if (size <= 0 || size > 20) errors.size = "Size must be greater than or equal to 1 and less than or equal to 20";

    page = parseInt(page);
    size = parseInt(size);
    pagination.limit = size;
    pagination.offset = size * (page - 1);

    if (minLat) {
        if (!isNaN(minLat)) {
            where.lat = { ...where.lat, [Op.gte]: parseFloat(minLat) };
        } else {
            errors.minLat = "Minimum latitude is invalid";
        }
    }

    if (maxLat) {
        if (!isNaN(maxLat)) {
            where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
        } else {
            errors.maxaLat = "Maximum latitude is invalid";
        }
    }

    if (minLng) {
        if (!isNaN(minLng)) {
            where.lng = { ...where.lng, [Op.gte]: parseFloat(minLng) };
        } else {
            errors.minLng = "Minimum longitude is invalid";
        }
    }

    if (maxLng) {
        if (!isNaN(maxLng)) {
            where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
        } else {
            errors.maxLng = "Maximum longitude is invalid";
        }
    }

    if (minPrice) {
        if (!isNaN(minPrice) && minPrice >= 0) {
            where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
        } else {
            errors.minPrice = "Minimum price must be greater than or equal to 0";
        }
    }

    if (maxPrice) {
        if (!isNaN(maxPrice) && maxPrice >= 0) {
            where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
        } else {
            errors.maxPrice = "Maximum price must be greater than or equal to 0"
        }
    }

    if (Object.keys(errors).length > 0) {
        res.status(400);
        return res.json({
            "message": "Bad Request",
            errors
        });
    }

    let allSpots = await Spot.findAll({
        where,
        ...pagination
    });

    res.status(200);
    return res.json({
        "Spots": allSpots,
        page,
        size
    });
});

module.exports = router;
