import { Router } from "express";
import * as fp from "../data/fitposts.js";
import * as user from "../data/users.js";
import * as wardrobe from "../data/wardrobes.js";
import { fitposts, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import {
    validString,
    addSignedUrlsToFitPosts_in_fitposts,
    convertDate,
    addSignedUrlsToPosts,
    addSignedUrlsToOutfitPieces,
    addDescLinksForFitposts,
} from "../helper.js";
import xss from "xss";
import { getAllFromCloset } from '../data/outfitPieces.js';

const router = Router();

router.route("/").get(async (req, res) => {
    //code here for GET will render the home handlebars file
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    try {
        let fpList = await fp.getAll();
        const postsWithSignedUrls = await addSignedUrlsToFitPosts_in_fitposts(
            fpList
        );
        for (let fit of postsWithSignedUrls) {
            fit.postedDate = convertDate(fit);
        }
        const postsWithDescLinks = await addDescLinksForFitposts(postsWithSignedUrls);
        let drobes = await wardrobe.getWardrobesByIds(req.session.user.wardrobes);

        return res.render("explore_page", {
            title: "Explore",
            fitposts: postsWithDescLinks,
            wardrobes: drobes,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.route('/create')
    .get(async (req, res) => {
        // need to change so that it only gets outfit pieces that the user has in their closet
        if (!req.session || !req.session.user) {
            res.status(500).send("Not logged in");
        }
        try {
            let closetOutfitPieces = await getAllFromCloset(req.session.user.username);

            let postsUrls = await addSignedUrlsToOutfitPieces(closetOutfitPieces);
            //console.log(postsUrls);

            let headwear = postsUrls.filter((element) => {
                return element.outfitType === "head";
            });
            let bodywear = postsUrls.filter((element) => {
                return element.outfitType === "body";
            });
            let legwear = postsUrls.filter((element) => {
                return element.outfitType === "leg";
            });
            let footwear = postsUrls.filter((element) => {
                return element.outfitType === "foot";
            });

            res.render("your_page", {
                title: "Create Fitpost",
                head: headwear,
                body: bodywear,
                leg: legwear,
                foot: footwear,
                script_partial: "createFP_script",
            });
        } catch (e) {
            return res.status(500).send(e.message);
        }
    })
    .post(async (req, res) => {
        //console.log("found the post route!");
        if (req.session && req.session.user) {
            let data = req.body;
            const user = req.session.user;
            //console.log(user);

            try {
                if (!data.headwear) throw new Error("Headwear not provided in route");
                if (!data.bodywear) throw new Error("Bodywear not provided in route");
                if (!data.legwear) throw new Error("Legwear not provided in route");
                if (!data.footwear) throw new Error("Footwear not provided in route");
                if (!data.head_id) throw new Error("Head_id not provided in route");
                if (!data.body_id) throw new Error("Body_id not provided in route");
                if (!data.leg_id) throw new Error("Leg_id not provided in route");
                if (!data.foot_id) throw new Error("Foot_id not provided in route");
            } catch (e) {
                res.status(400).send(e);
            }

            try {
                data.headwear = validString(data.headwear);
                data.headwear = xss(data.headwear);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.head_id = validString(data.head_id);
                data.head_id = xss(data.head_id);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.bodywear = validString(data.bodywear);
                data.bodywear = xss(data.bodywear);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.body_id = validString(data.body_id);
                data.body_id = xss(data.body_id);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.legwear = validString(data.legwear);
                data.legwear = xss(data.legwear);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.leg_id = validString(data.leg_id);
                data.leg_id = xss(data.leg_id);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.footwear = validString(data.footwear);
                data.footwear = xss(data.footwear);
            } catch (e) {
                res.status(400).send(e);
            }
            try {
                data.foot_id = validString(data.foot_id);
                data.foot_id = xss(data.foot_id);
            } catch (e) {
                res.status(400).send(e);
            }

            try {
                const newFitpost = await fp.createFP(
                    user._id,
                    user.username,
                    data.headwear,
                    data.bodywear,
                    data.legwear,
                    data.footwear,
                    data.head_id,
                    data.body_id,
                    data.leg_id,
                    data.foot_id
                );
                res.status(200).redirect("/");
            } catch (e) {
                res.status(500).json({ error: e });
            }
        } else {
            res.status(500).send("Not logged in");
        }
    });

router.route("/trending").get(async (req, res) => {
    //code here for GET will render the home handlebars file
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    try {
        let fpList = await fp.trending();
        const postsWithSignedUrls = await addSignedUrlsToFitPosts_in_fitposts(
            fpList
        );
        for (const fit of postsWithSignedUrls) {
            fit.postedDate = convertDate(fit);
        }
        const postsWithDescLinks = await addDescLinksForFitposts(postsWithSignedUrls);
        let drobes = await wardrobe.getWardrobesByIds(req.session.user.wardrobes);
        return res.render("explore_page", {
            title: "Trending",
            fitposts: postsWithDescLinks,
            wardrobes: drobes,
            username: req.session.user.username,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.route("/latest").get(async (req, res) => {
    //code here for GET will render the home handlebars file
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    try {
        let fpList = await fp.latest();
        const postsWithSignedUrls = await addSignedUrlsToFitPosts_in_fitposts(
            fpList
        );
        for (const fit of postsWithSignedUrls) {
            fit.postedDate = convertDate(fit);
        }
        const postsWithDescLinks = await addDescLinksForFitposts(postsWithSignedUrls);
        let drobes = await wardrobe.getWardrobesByIds(req.session.user.wardrobes);

        return res.render("explore_page", {
            title: "Latest",
            fitposts: postsWithDescLinks,
            wardrobes: drobes,
            username: req.session.user.username,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.route("/user/:uid").get(async (req, res) => {
    //code here for GET a single movie
    //console.log(req.params.uid);
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    let userId = req.params.uid;
    try {
        userId = validString(userId);
    } catch (e) {
        return res.status(500).send(e);
    }
    try {
        let fpList = await fp.searchByUID(userId);
        // will need to change later to show user name and not user id
        const postsWithSignedUrls = await addSignedUrlsToFitPosts_in_fitposts(
            fpList
        );
        for (const fit of postsWithSignedUrls) {
            fit.postedDate = convertDate(fit);
        }
        const postsWithDescLinks = await addDescLinksForFitposts(postsWithSignedUrls);
        let drobes = await wardrobe.getWardrobesByIds(req.session.user.wardrobes);

        return res.render("explore_page", {
            title: `${req.session.user.username}'s FitPosts`,
            fitposts: postsWithDescLinks,
            wardrobes: drobes,
            username: req.session.user.username,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
});

router.get("/favorites", async (req, res) => {
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    async function getFavoriteFitposts(username) {
        try {
            // Get the user's favorite array
            const usersCollection = await users();
            const user = await usersCollection.findOne(
                { username: username },
                { favorite: 1 }
            );
            const favoriteIds = user.favorite;
            console.log('favorit ids', favoriteIds);
            const favoriteObjectIds = favoriteIds.map((id) => new ObjectId(id));
            console.log('favobjectids', favoriteObjectIds);
            console.log('this is ids', favoriteIds);
            const fitpostCollection = await fitposts();
            const favoriteFitposts = await fitpostCollection
                .find({
                    _id: { $in: favoriteObjectIds },
                })
                .toArray();

            for (let fit of favoriteFitposts) {
                fit.postedDate = convertDate(fit);
            }

            return favoriteFitposts;
        } catch (error) {
            console.error("Error retrieving favorite fitposts:", error);
            throw error;
        }
    }

    try {
        const favorites = await getFavoriteFitposts(req.session.user.username);
        // Handle the favorites data as needed
        const favWithUrl = await addSignedUrlsToFitPosts_in_fitposts(favorites);
        let drobes = await wardrobe.getWardrobesByIds(req.session.user.wardrobes);
        const postsWithDescLinks = await addDescLinksForFitposts(favWithUrl);
        return res.render("explore_page", {
            title: "Favorites",
            fitposts: postsWithDescLinks,
            wardrobes: drobes,
            username: req.session.user.username,
        });
    } catch (error) {
        console.error("Error retrieving favorites:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

})

router.route("/:id").get(async (req, res) => {
    //console.log(req.params.id);
    if (!req.session || !req.session.user) {
        res.status(500).send("Not logged in");
    }
    let fpid = req.params.id;
    try {
        fpid = validString(fpid);
    } catch (e) {
        return res.status(500).send(e);
    }
    try {
        let fitpost = await fp.searchByFPID(fpid);
        const postsWithSignedUrls = await addSignedUrlsToFitPosts_in_fitposts(
            fpList
        );
        for (const fit of postsWithSignedUrls) {
            fit.postedDate = convertDate(fit);
        }
        return res.render("fitpost_page", { post: postsWithSignedUrls });
        //return res.render('explore_page', {title: `${userId}'s FitPosts`, fitposts:  fpList});
    } catch (e) {
        return res.status(500).send(e);
    }
});

// POST route for handling like action
router.post("/like", async (req, res) => {
    const data = req.body;

    const userId = req.session.user._id;
    if (!data || Object.keys(data).length === 0) {
        return res
            .status(400)
            .json({ error: "There are no fields in the request body" });
    }
    try {
        // like or unlike
        let updatedFitpost;

        if (await user.checkLike(userId, data.fitpostId)) {
            await user.removeLike(userId, data.fitpostId);
            updatedFitpost = await fp.removeLike(data.fitpostId);
        } else {
            console.log("this is user id", userId);
            await user.addLike(userId, data.fitpostId);
            updatedFitpost = await fp.addLike(data.fitpostId);
        }
        res.status(200).json(updatedFitpost);
        //res.redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// POST route for handling save action
router.post("/save", async (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res
            .status(400)
            .json({ error: "There are no fields in the request body" });
    }
    try {
        if (data.wardrobeId === "new") {
            //make new wardrobe, req.session.user.userId, data.newName, data.fitpostId
            //add wardrobe under user
            let newDrobeId = await wardrobe.createNewWardrobe(
                data.newName,
                data.fitpostId,
                req.session.user._id
            );
            await user.addWardrobe(req.session.user._id, newDrobeId);
            let addedWardrobe = await wardrobe.getWardrobeById(newDrobeId);
            return res.status(200).json(addedWardrobe);
        } else {
            //add to existing wardrobe,  req.session.user.userId, data.wardrobeId, data.fitpostId
            //check if fitpost exists in wardrobe alreadyl
            let drobe = await wardrobe.getWardrobeById(data.wardrobeId);
            for (let post of drobe.fitposts) {
                if (post._id === data.fitpostId) {
                    return res.status(400).json({ error: "already saved" });
                }
            }

            await wardrobe.addFitpost(data.wardrobeId, data.fitpostId);
        }
        const updatedFitpost = await fp.addSave(data.fitpostId);
        res.status(200).json(updatedFitpost);
        //res.redirect('back');
    } catch (error) {
        console.log(error, "oops");
        res.status(500).send(error);
    }
});

router.post("/closet", async (req, res) => {
    const data = req.body;
    const userId = req.session.user._id;
    let currentUser = await user.getUserById(userId);
    if (currentUser.closet.includes(data.pid)) {
        return res.status(400).json({ error: "already saved" });
    }
    let updated = await user.addToCloset(userId, data.pid);
    return res.status(200).json(updated);
});


export default router;
