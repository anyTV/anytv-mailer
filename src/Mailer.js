'use strict';

import { EmailTemplate as Template } from 'email-templates';
import i18n from 'anytv-i18n';
import _ from 'lodash';
import { Language } from './Language.js';
import country_language_map from './country_language_map.js';



export default class Mailer {

    constructor (config) {

        this.config = config;

        this._to = void 0;
        this._html = void 0;
        this._opts = void 0;
        this._subject = void 0;
        this._content = void 0;
        this._template = void 0;

        this._built = false;

        this._from = config.smtp_relay.sender;
        this._language = config.i18n.default;

        this._trans = this._trans.bind(this);
    }


    _trans (param) {

        return typeof param === 'object'
            ? i18n.trans(this._language, param.trans, param.data)
            : param;
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


    language (lang) {
        this._language = lang || this._language;
        return this;
    }


    /**
     * gets the language code given 1 or more country or country code
     * returns the default language if not found
     *
     * @example:
     *      // where one of these countries can be null
     *      mailer.derive_language(user_country, channel_country, signup_country)
     */
    derive_language (...keys) {

        const find = key =>
            language_group =>
                _.includes(language_group.countries, key)
                || language_group.countries[key];

        // used a native for loop to make the loop end
        // as soon as a match is found
        for (let i = 0; i < keys.length; i += 1) {

            const key = keys[i];

            const match = _.filter(country_language_map, find(key));

            if (match.length) {
                this._language = match[0].language;
                break;
            }
        }

        return this;
    }


    template (tpl) {
        this._template = tpl;
        return this;
    }

    content (_content) {
        this._content = _content;
        return this;
    }


    build (next) {
        let mail_content_translation = () => {
            // process translation if it's an object
            this._subject = this._trans(this ._subject);

            // process content
            if (this._content) {
                this._content = _.mapValues(this._content, this._trans);
            }
        };

        let render = () => {
            // create Template object
            const template = new Template(
                this.config.templates_dir + this._template);

            template.render(this._content, (err, result) => {

                if (err) {
                    return next(
                        'Error in rendering template: ' + JSON.stringify(err));
                }

                this._html = result.html;

                this._opts = {
                    to: this._to,
                    from: this._from,
                    subject: this._subject,
                    html: this._html
                };

                this._built = true;

                next();
            });
        };

        let generate_mail = () => {
            mail_content_translation();
            render();
        };

        if (!this._to) {
            return next('Email does not have a recipient. Call mailer.to()');
        }

        if (!this._from) {
            return next('Email does not have a sender. Call mailer.from()');
        }

        if (!this._subject) {
            return next('Email does not have a subject. Call mailer.subject()');
        }

        if (!this._template) {
            return next('Email does not have a template. Call mailer.template()');
        }

        if (this._built) {
            return next();
        }

        if (this._need_recommendation) {
            (new Language(this.config.database))
                .recommend_language(this._recommend_for)
                .then(this.language)
                .catch(() => this.language('en'))
                .then(generate_mail);
        } else {
            generate_mail();
        }
    }


    then (next) {

        const send = (err, result) => {

            if (err) {
                return next(err, result);
            }

            if (this.config.smtp_relay.pretend) {
                return next();
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

    recommend_language (identifier) {
        if (!_.has(this.config, 'database.ytfreedom')) {
            console.log('Missing ytfreedom database configuration');

            return this;
        }

        if (!_.has(this.config, 'database.master')) {
            console.log('Missing master database configuration');

            return this;
        }

        if (this._built) {
            console.log('Mail was already built. Doing nothing');

            return this;
        }

        if (!this._to) {
            throw new Error('Recipients has not been set');
        }

        if (_.isArray(this._to) && this._to.length > 1) {
            console.log('Defaulting to english because there are more than 1 recipient', JSON.stringify(this._to));

            return this.language('en');
        }

        this._need_recommendation = true;
        this._recommend_for = identifier || this._to;

        return this;
    }
}
