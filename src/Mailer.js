

import templater from 'anytv-templater';
import logger from './lib/logger';


export default class Mailer extends templater.Templater {

    constructor(config) {

        super(config);

        this._to = void 0;
        this._cc = void 0;
        this._bcc = void 0;
        this._opts = void 0;
        this._subject = void 0;

        this._from = config.smtp_relay.sender;

        this._logger = config.logger || logger;
    }


    set_logger(custom_logger) {
        this._logger = custom_logger;

        return this;
    }


    to(emails) {
        this._to = this._parse_email(emails);

        return this;
    }

    cc(emails) {
        this._cc = this._parse_email(emails);

        return this;
    }

    bcc(emails) {
        this._bcc = this._parse_email(emails);

        return this;
    }


    from(sender) {
        this._from = sender || this._from;

        return this;
    }


    subject(subj) {
        this._subject = subj;

        return this;
    }


    // @@override
    _render(next) {

        super._render((err) => {

            if (!err) {

                this._opts = {
                    to: this._to,
                    cc: this._cc,
                    bcc: this._bcc,
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
    _translate_content() {

        super._translate_content();

        // process translation if it's an object
        this._subject = this._trans(this._subject);

        return this;
    }

    _parse_email(emails) {
        if (typeof emails === 'string') {
            emails = emails.split(',');
        }

        return emails.join(',');
    }

    // @@override
    build(next) {

        if (!this._to && !this._cc && !this._bcc) {
            return next('Email does not have a recipient. Call mailer.to(), mailer.cc() and mailer.bcc()  ');
        }

        if (!this._from) {
            return next('Email does not have a sender. Call mailer.from()');
        }

        if (!this._subject) {
            return next('Email does not have a subject. Call mailer.subject()');
        }

        super.build(next);
    }


    then(next) {

        const send = (err, result) => {

            if (err) {
                return next(err, result);
            }

            if (this.config.smtp_relay.pretend) {

                (this._logger.debug || this._logger.info)(`pretending to send email to ${this._to}`, this._html);

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
