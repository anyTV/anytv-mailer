'use strict';

import squel from 'squel';
import mysql from 'anytv-node-mysql';
import _ from 'lodash';
import supported_languages from './country_language_map.js';

export class Language {

    constructor (database) {
        mysql.add('ytfreedom', database.ytfreedom)
        .add('master', database.master);
    }

    recommend_language (recipient) {
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
                    .use('ytfreedom')
                    .squel(query, check_user_information)
                    .end();
            }

            function check_user_information (error, user_row) {
                if (error) {
                    return reject(error);
                }

                if (!user_row) {
                    return reject('User not found');
                }

                user_row = user_row[0];

                username = user_row.username;
                user_id = user_row.id;

                const language_shorthands_map = _.map(
                    supported_languages,
                    v => v.language
                );

                if (language_shorthands_map.indexOf(user_row.lang) > -1) {
                    return resolve(user_row.lang);
                }

                const language_keys = Object.keys(supported_languages);

                for (const key of language_keys) {
                    const countries = _.values(supported_languages[key].countries);

                    if (countries.indexOf(user_row.country) > -1) {
                        return resolve(supported_languages[key].language);
                    }
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
                    .use('master')
                    .squel(query, check_channel_information)
                    .end();
            }

            function check_channel_information (error, result) {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject('User not found');
                }

                result = result[0];

                const languages = supported_languages;
                const language_keys = Object.keys(languages);

                for (const key of language_keys) {
                    const countries = languages[key].countries;

                    if (countries[result.location]) {
                        return resolve(languages[key].language);
                    }
                }

                if (language_keys.indexOf(result.written_language) > -1) {
                    return resolve(languages[result.written_language].language);
                }

                return reject();
            }

            start();
        });
    }
}
