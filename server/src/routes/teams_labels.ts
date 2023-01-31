// Teams can have multiple labels at different sizes
// Current idea is that only one label per size can be active at a time

import express from 'express'
import { 
    getLabels,
    createLabel,
    // deleteLabel,
} from '../controllers/teams_labels';

const router = express.Router({
    mergeParams: true
});

// TODO:
// Make it so this route has query params for width and length
router.get('/', getLabels);

router.post('/', createLabel);

// router.delete('/:id', deleteLabel);

export default router;