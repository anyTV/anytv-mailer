'use strict';

import nodemailer from 'nodemailer';
import Mailer from './Mailer';
import i18n from 'anytv-i18n';


let CONFIG;


export default class {

    /**
     * configuration for all instance of Mailer
     * @public
     * @return itself
     */
    static configure (config) {

        if (!config) {
            throw new Error('configuration is missing');
        }

        if (!config.smtp_relay) {
            throw new Error('smtp_relay config is missing');
        }

        if (!config.templates_dir) {
            throw new Error('templates directory is missing');
        }

        if (!config.i18n) {
            throw new Error('i18n config is missing');
        }

        // make it end in trailing slash
        if (config.templates_dir.substr(-1) !== '/') {
            config.templates_dir += '/';
        }

        config.transporter = nodemailer.createTransport({
            host: config.smtp_relay.host,
            port: config.smtp_relay.port,
            auth: config.smtp_relay.auth
        });

        i18n.configure(config.i18n)
            .use(config.i18n.project)
            .load();

        CONFIG = config;

        return true;
    }


    static get send_mail () {

        if (!CONFIG) {
            throw new Error('Configuration is missing. Call mailer.configure()');
        }

        return new Mailer(CONFIG);
    }
}
