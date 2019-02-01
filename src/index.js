

import templater from 'anytv-templater';
import nodemailer from 'nodemailer';
import Mailer from './Mailer';


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

        config.transporter = nodemailer.createTransport({
            host: config.smtp_relay.host,
            port: config.smtp_relay.port,
            auth: config.smtp_relay.auth
        });

        templater.configure(config);

        CONFIG = config;

        return true;
    }


    static get send_mail () {

        if (!CONFIG) {
            throw new Error('Configuration is missing. Call mailer.configure()');
        }

        return new Mailer(CONFIG);
    }


    static get Mailer () {
        return Mailer;
    }
}
