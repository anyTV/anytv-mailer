'use strict';

import _ from 'lodash';
import squel from 'squel';
import mysql from 'anytv-node-mysql';
import languages from './config/country_language_map.js';

export class Language {

    constructor (database) {
        this._ytfreedom_db = database.ytfreedom;
        this._master_db = database.master;
    }

    recommend_language (recipient) {
        const self = this;

        return new Promise((resolve, reject) => {
            let username;
            let user_id;

            function start () {
                const query = squel.select()
                    .from('users');

                if (_.isInteger(recipient)) {
                    query.where('id = ?', recipient);
                } else {
                    query.where('email = ?', recipient);
                }

                query
                    .order('created_at', false)
                    .limit(1);

                mysql
                    .use(self._ytfreedom_db)
                    .squel(query, check_user_information)
                    .end();
            }

            function check_user_information (error, user_row) {
                if (error) {
                    return reject(error);
                }

                if (!user_row.length) {
                    return reject('User not found');
                }

                user_row = user_row[0];

                username = user_row.username;
                user_id = user_row.id;

                let match = _.find(
                    languages,
                    v => v.language === user_row.lang
                );

                if (match) {
                    return resolve(match.language);
                }

                match = _.find(
                    languages,
                    v => _.values(v.countries).indexOf(user_row.country) > -1
                );

                if (match) {
                    return resolve(match.language);
                }

                const query = squel.select()
                    .from('mcn_channels');

                if (user_id) {
                    query.where('dashboard_user_id = ?', user_id);
                }

                if (username) {
                    query.where('username = ?', username);
                }

                query.order('update_date', false)
                    .limit(1);

                mysql
                    .use(self._master_db)
                    .squel(query, check_channel_information)
                    .end();
            }

            function check_channel_information (error, channel_row) {
                if (error) {
                    return reject(error);
                }

                if (!channel_row.length) {
                    return reject('User not found');
                }

                channel_row = channel_row[0];

                const match = _.find(
                    languages,
                    v => v.countries[channel_row.location]
                );

                if (match) {
                    return resolve(match.language);
                }

                if (languages[channel_row.written_language]) {
                    return resolve(languages[channel_row.written_language].language);
                }

                return reject();
            }

            start();
        });
    }
}
