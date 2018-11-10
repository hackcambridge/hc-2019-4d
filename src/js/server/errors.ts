import chalk from 'chalk';

export function middleware(err, req, res, next) {
  const message = err.stack || err.toString();
  console.error(chalk.red.underline('The server encountered an error.'));
  console.error(message);
  res.status(err.status || 500);

  const locals: any = { };

  if (req.app.get('env') === 'development') {
    locals.message = message;
  }

  res.render('error.html', locals);
};
