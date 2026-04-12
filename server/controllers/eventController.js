const Event = require('../models/Event');
const mongoose = require('mongoose');

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(20)
            .populate('createdBy', 'name department');
        res.json(events);
    } catch (err) {
        console.error('getEvents error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;
        if (!title || !date || !time || !location) {
            return res.status(400).json({ error: 'Title, date, time, and location are required' });
        }
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        if (eventDate < new Date(new Date().toDateString())) {
            return res.status(400).json({ error: 'Event date cannot be in the past' });
        }
        const event = await Event.create({
            title,
            description: description || '',
            date,
            time,
            location,
            createdBy: req.user._id
        });
        const populated = await event.populate('createdBy', 'name department');
        res.status(201).json(populated);
    } catch (err) {
        console.error('createEvent error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own events' });
        }
        await event.deleteOne();
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error('deleteEvent error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
