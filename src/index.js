#!/usr/bin/env node
import fs from 'fs';
import program from 'commander';
import Push from './Push';

program
  .version('1.0.0');

program
  .command('setup')
  .description('set up enviromentals to send push notifications')
  .option('--androidSenderAPIKey [apiKey]', 'Android API Key')
  .option('--iosCert <path>', 'iOS .p8 cert')
  .option('--iosTeamId [teamId]', 'iOS Team ID')
  .option('--iosKeyId [keyId]', 'iOS Key ID')
  .option('--iosEnv [env]', 'iOS Env (Sandbox | Production)')
  .option('--bundle [bundleId]', 'Bundle ID')
  .action(options => {
    fs.writeFile('./config.json', JSON.stringify({
      androidSenderAPIKey: options.androidSenderAPIKey || '',
      iosCert: options.iosCert || '',
      iosTeamId: options.iosTeamId || '',
      iosKeyId: options.iosKeyId || '',
      iosEnv: options.iosEnv || '',
      bundle: options.bundle || ''
    }), err => {
      if (err) throw err;
      console.log('Config saved successfully!');
    });
  });

  program
    .command('send [os]')
    .option('-t, --title [title]', 'Title of Push Notification')
    .option('-m, --message [message]', 'Push Notification Message')
    .option('-d, --devices [devices]', 'String or array of PN tokens for devices')
    .action((os, options) => {
      if (!['android', 'ios'].includes(os.toLowerCase())) throw new Error(`${os} is not supported.`);
      let config = {};
      if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      } else {
        throw new Error('You must run "pushtester setup" first');
      }

      if (!options.title || !options.message || !options.devices) {
        throw new Error('You must specify a title, message, and device tokens. Run pushtester send --help for more information.');
      }
      if (os.toLowerCase() === 'ios') {
        Push.ios(config, {
          title: options.title,
          message: options.message
        }, options.devices);
      } else if (os.toLowerCase() === 'android') {
        Push.android(config, {
          title: options.title,
          message: options.message
        }, options.devices);
      }
    });

program.parse(process.argv);
