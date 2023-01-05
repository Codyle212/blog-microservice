import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let posts = {};

const handleEvent = (type, data) => {
    if (type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { id, title, comments: [] };
    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        const post = posts[postId];
        post.comments.push({ id, content, status });
        posts = { ...posts, [postId]: post };
    }

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;
        const post = posts[postId];
        const comment = post.comments.find((comment) => comment.id === id);

        comment.status = status;
        comment.content = content;
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.send({});
});

app.listen(4002, async () => {
    console.log('listening on 4002');
    try {
        const response = await axios.get(
            'http://event-bus-service:4005/events'
        );

        for (let event of response.data) {
            console.log('Processing Event:', event.type);
            handleEvent(event.type, event.data);
        }
    } catch (error) {
        console.log(error.message);
    }
});
