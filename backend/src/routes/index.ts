import { Router } from 'express';
import leadsRoutes from './leadsRoutes';
import callsRoutes from './callsRoutes';
import siteVisitsRoutes from './siteVisitsRoutes';
import documentsRoutes from './documentsRoutes';
import statsRoutes from './statsRoutes';

const apiRouter = Router();

apiRouter.use('/leads', leadsRoutes);
apiRouter.use('/calls', callsRoutes);
apiRouter.use('/site-visits', siteVisitsRoutes);
apiRouter.use('/documents', documentsRoutes);
apiRouter.use('/', statsRoutes);

export default apiRouter;
