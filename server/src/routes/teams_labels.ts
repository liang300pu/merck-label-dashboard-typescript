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

router.get('/:team', getLabels);

router.post('/:team', createLabel);

// router.delete('/:id', deleteLabel);

export default router;