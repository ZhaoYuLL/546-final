import { Router } from 'express';
import * as fp from '../data/fitposts.js';
import * as helper from '../helper.js';

const router = Router();

router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
        let fpList = await fp.getAll();
        return res.render('explore_page', {title: 'Explore', fitposts:  fpList});
    }
    catch (e) {
        return res.status(500).send(e);
    }
});

router.route('/trending').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
        let fpList = await fp.trending();
        return res.render('explore_page', {title: 'Trending', fitposts:  fpList});
    }
    catch (e) {
        return res.status(500).send(e);
    }
});

router.route('/latest').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
        let fpList = await fp.latest();
        return res.render('explore_page', {title: 'Latest', fitposts:  fpList});
    }
    catch (e) {
        return res.status(500).send(e);
    }
});


router.route('/:id').get(async (req, res) => {
    //code here for GET a single movie
    console.log(req.params.id);
    let userId = req.params.id;
    try {
        userId = helper.validString(userId);
    } catch (e) {
        return res.status(500).send(e);
    }
    try {
        let fpList = await fp.searchByUID(userId);
        // will need to change later to show user name and not user id
        return res.render('explore_page', {title: `${userId}'s FitPosts`, fitposts:  fpList});
    } catch (e) {
        return res.status(500).send(e);
    }
  });
  



export default router;