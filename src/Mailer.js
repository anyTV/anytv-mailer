'use strict';

import templater from 'anytv-templater';


export default class Mailer extends templater.Templater {

    constructor (config) {

        super(config);

        this._to = void 0;
        this._opts = void 0;
        this._subject = void 0;

        this._from = config.smtp_relay.sender;

        this._logger = config.logger || console;
    }


    set_logger(logger) {
        this._logger = logger;
        return this;
    }


    to (emails) {

        if (typeof emails === 'string') {
            emails = emails.split(',');
        }

        this._to = emails.join(',');

        return this;
    }


    from (sender) {
        this._from = sender || this._from;
        return this;
    }


    subject (subj) {
        this._subject = subj;
        return this;
    }


    // @@override
    _render (next) {

        super._render((err) => {

            if (!err) {

                this._opts = {
                    to: this._to,
                    from: this._from,
                    subject: this._subject,
                    html: this._html
                };
            }

            next(err);
        });

        return this;
    }


    // @@override
    _translate_content () {

        super._translate_content();

        // process translation if it's an object
        this._subject = this._trans(this ._subject);

        return this;
    }


    // @@override
    build (next) {

        if (!this._to) {
            return next('Email does not have a recipient. Call mailer.to()');
        }

        if (!this._from) {
            return next('Email does not have a sender. Call mailer.from()');
        }

        if (!this._subject) {
            return next('Email does not have a subject. Call mailer.subject()');
        }

        super.build(next);
    }


    then (next) {

        const send = (err, result) => {

            if (err) {
                return next(err, result);
            }

            if (this.config.smtp_relay.pretend) {
                this._logger.debug(`pretending to send email to ${this._to}`);
                return next(null, {
                    accepted: this._to.split(','),
                    pretend: true
                });
            }

            this.config
                .transporter
                .sendMail(this._opts, next);
        };

        if (this._built) {
            return send();
        }

        this.build(send);
    }

}
