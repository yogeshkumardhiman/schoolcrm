import { TransportRoute, TransportStop } from '../../models/index.js';

const getRoutes = async (req, res) => {
    try {
        const routes = await TransportRoute.findAll({
            include: [{ model: TransportStop, as: 'stops' }],
            order: [['name', 'ASC']]
        });
        res.json(routes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getStops = async (req, res) => {
    try {
        const stops = await TransportStop.findAll({
            include: [{ model: TransportRoute, as: 'route' }],
            order: [['stopName', 'ASC']]
        });
        res.json(stops);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createRoute = async (req, res) => {
    try {
        const { id, routeName, monthlyFee, busNumber, description } = req.body;
        if (id && id !== 'new') {
            const route = await TransportRoute.findByPk(id);
            if (!route) return res.status(404).json({ error: 'Route not found' });
            await route.update({ 
                routeName, 
                name: routeName, 
                monthlyFee: monthlyFee || 0, 
                busNumber, 
                description 
            });
            res.json(route);
        } else {
            const route = await TransportRoute.create({ 
                routeName, 
                name: routeName, 
                monthlyFee: monthlyFee || 0, 
                busNumber, 
                description 
            });
            res.json(route);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        await TransportRoute.destroy({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const createStop = async (req, res) => {
    try {
        const { routeId, stopName, fee } = req.body;
        const stop = await TransportStop.create({ routeId, stopName, fee });
        res.json(stop);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export default {
    getRoutes,
    getStops,
    createRoute,
    deleteRoute,
    createStop
};
