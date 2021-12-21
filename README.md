# anytv-mailer

A module for sending emails


## Install

```sh
npm install anytv-mailer@latest --save
```

## Introduction

Simple example:
```js
'use strict';


const mailer = require('anytv-mailer');
const i18n = require('anytv-i18n');
const logger = require('./helpers/logger');


// on server.js
mailer.configure({

    smtp_relay: {
        pretend: false,
        sender: 'Mailer! <info@server.com>',
        host: '',
        port: 587,
        auth: {
            user: '',
            pass: ''
        }
    },

    i18n: i18n,

    templates_dir: 'directory/of/templates',

    /**
    *  This is optional, include this only when you're going to use
    *  .recommend_language
    */
    database: {
        ytfreedom: {
            host: 'localhost',
            database: 'ytfreedom',
            user: 'root',
            password: ''
        },
        master: {
            host: 'localhost',
            database: 'master',
            user: 'root',
            password: ''

        }
    }
});



// call to send email
mailer.send_mail

    // csv of email address or array
    .to(row.email)

    // optional
    .cc(row.cc)

    // optional
    .bcc(row.bcc)

    // omit to use smtp_relay.sender
    .from('something@freedom.tm')

    .subject(
        // string or object
        // object value will be used to call i18n.trans
        {
            trans: 'email-subject',
            data: {
                name: row.name
            }
        }
    )


    // specify language explicitly
    .language('en')
    // or derive using country/country code
    .derive_language(row.user_country, row.channel_country)


    .template('my_template')

    .content({
        /**
         * the keys are the template variables, values can be string/number/object
         * object value will be used to call i18n.trans
         */
        email_body: { trans: 'monetization-suspended-email', data: {channel_name: row.channel_name}},
        email_greetings: { trans: 'email-greetings'},
        thank_you: { trans: 'thank-you'},
        the_freedom_team: { trans: 'the-freedom-team'},
        our_mailing_address: { trans: 'our-mailing-address'},
        year: (new Date()).getFullYear()
    })
    // optionally have the mailer guess the language appropriate for the recipient
    .recommend_language()

    /**
     * Optionally, set a custom logger.
     * By default, winston is used.
     */
    .set_logger(logger)

    // .build() will just build the whole string plus metadata

    // optional
    .attach(files)

    // will call .build if not called then send
    .then();

```


# Todo
- [ ] Complete test cases
- [ ] Use nodemailer-mock
- [ ] Support `reply to`


# Contributing

Install the tools needed:
```sh
sudo npm i grunt -g
npm i
```

To compile the ES6 source code to ES5:
```sh
npm start
```

# Running test

```sh
sudo npm i serve_me -g
serve_me test/locales 8081
npm test
```

# License

MIT


# Author
[Freedom! Labs, any.TV Limited DBA Freedom!](https://www.freedom.tm)
