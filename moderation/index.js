import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/events', async (req, res) => {
    const {
        type,
        data: { id, content, postId },
    } = req.body;
    if (type === 'CommentCreated') {
        const status = content.includes('orange') ? 'rejected' : 'approved';
        await axios.post('http://event-bus-service:4005/events', {
            type: 'CommentModerated',
            data: {
                id,
                postId,
                status,
                content,
            },
        });
    }
    res.send({});
});

app.listen(4003, () => {
    console.log('listening on 4003');
});
