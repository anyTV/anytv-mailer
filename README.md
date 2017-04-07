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


// on server.js
mailer.configure({

    smtp: {
        pretend: false,
        sender: 'Freedom! <support@freedom.tm>',
        host: '',
        port: 587,
        auth: {
            user: '',
            pass: ''
        }
    },

    i18n: {
        languages_url: 'https://api-translations.freedom.tm/:project/latest/languages',
        translations_url: 'https://api-translations.freedom.tm/:project/latest/translations?ext=json&lang=:lang',
        default: 'en',
        project: 'freedom_dashboard'
    },

    templates_dir: 'directory/of/templates'
});



// call to send email
mailer.send_mail

    // csv of email address or array
    .to(row.email)

    // omit to use smtp.sender
    .from('something@freedom.tm')

    .subject(
        // string or object
        // object value will be used to call i18n.trans
        {
            trans: 'monetization-suspended-email-subject',
            data: {
                channel_name: row.channel_name
            }
        }
    )


    // specify language explicitly
    .language('en')
    // or derive using country/country code
    .derive_language(row.user_country, row.channel_country)


    .template('monetization_suspended')

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


    // .build() will just build the whole string plus metadata

    // .attach(files) may not be implemented yet

    // will call .build if not called then send
    .then();

```


# Todo
- [ ] Complete test cases
- [ ] Use nodemailer-mock


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
npm test
```

# License

MIT


# Author
[Freedom! Labs, any.TV Limited DBA Freedom!](https://www.freedom.tm)
