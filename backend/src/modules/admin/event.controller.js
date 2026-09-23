import { Event } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';

export const createEvent = async (req, res, next) => {
    try {
        const { title, date, time, location, participants, color, icon, description, type, endDate } = req.body;

        if (!title || !date) {
            throw new ApiError(400, 'Invalid Request: Event title and date are mandatory fields.');
        }

        const newEvent = await Event.create({
            title,
            date,
            time: time || 'ALL DAY',
            location: location || 'SDM School',
            participants: participants || 'All Classes',
            color: color || '#4F46E5',
            icon: icon || 'calendar',
            description: description || '',
            type: type || 'EVENT',
            endDate: endDate || date
        });

        res.status(201).json({
            message: 'Academic Calendar entry registered successfully',
            event: newEvent
        });
    } catch (err) {
        next(new ApiError(err.statusCode || 500, 'Calendar Entry Creation Failure', err.message));
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, date, time, location, participants, color, icon, description, type, endDate } = req.body;

        const event = await Event.findByPk(id);
        if (!event) {
            throw new ApiError(404, 'Calendar Entry Not Found: The specified event ID does not exist.');
        }

        await event.update({
            title: title !== undefined ? title : event.title,
            date: date !== undefined ? date : event.date,
            time: time !== undefined ? time : event.time,
            location: location !== undefined ? location : event.location,
            participants: participants !== undefined ? participants : event.participants,
            color: color !== undefined ? color : event.color,
            icon: icon !== undefined ? icon : event.icon,
            description: description !== undefined ? description : event.description,
            type: type !== undefined ? type : event.type,
            endDate: endDate !== undefined ? endDate : event.endDate
        });

        res.json({
            message: 'Academic Calendar entry updated successfully',
            event
        });
    } catch (err) {
        next(new ApiError(err.statusCode || 500, 'Calendar Entry Modification Failure', err.message));
    }
};

export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await Event.findByPk(id);
        if (!event) {
            throw new ApiError(404, 'Calendar Entry Not Found: The specified event ID does not exist.');
        }

        await event.destroy();

        res.json({
            message: 'Academic Calendar entry removed successfully'
        });
    } catch (err) {
        next(new ApiError(500, 'Calendar Entry Deletion Failure', err.message));
    }
};
