/**
 * @file api/index.js
 * @description Inward facing wrapper interface
 */

import compileRoutes from './compile.js';
import editorRoutes from './editor.js';
import homeRoutes from './home.js';
import loginRoutes from './login.js';
import registerRoutes from './register.js';

const constructorMethod = (app) => {
    app.use('/login', loginRoutes);
    app.use('/register', registerRoutes);
    app.use('/editor', editorRoutes);
    app.use('/home', homeRoutes);
    app.use('/compile', compileRoutes);
    app.use('*', (_, res) => {
        res.redirect('/login');
    });
};

export default constructorMethod;
