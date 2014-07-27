var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//parsecookie
var cookie = require('cookie');

var session = require('express-session')
	,RedisStore = require('connect-redis')(session);
var Imap = require('imap'),
    inspect = require('util').inspect;
var MailListener = require("mail-listener2");
var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

//socket


var store = new RedisStore({host: '127.0.0.1', port: 6379 })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	store : store,
	secret : 'hjvkjnrwkjnvrwnui42oiu4io2ujofijienceklacnlieo12931',
	resave : 'false',
	saveUninitialized: 'true'
}));
var debug = require('debug')('generated-express-app');
//var app = require('../app');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
var io = require('socket.io').listen(server);

var imap;

io.set('authorization', function (handshakeData, accept) {

  if(handshakeData.headers.cookie) {
	
		handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
		handshakeData.sessionID = handshakeData.cookie['connect.sid'].split('.')[0].substring(2);
		console.log(handshakeData.cookie['connect.sid']);
		store.get(handshakeData.sessionID, function (err, session) {
			console.log(session);
			if(typeof session.email === 'undefined' && typeof session.password === 'undefined') {
				accept('Error', false);
			} else {
				imap = new Imap({
							user: session.email,
							password: session.password,
							host: 'imap.gmail.com',
							port: 993,
							tls: true
						});
				accept(null, true);
			}
		});
  }
});
//var io = req.io;

io.sockets.on('connection', function (client) {
    console.log('connected socket');
//	console.log(socket);
	imap.on('error', function(err) {
		var error = err.toString();
		console.log(err);
		switch(err.source) {
			case 'timeout-auth':
			
			case 'timeout':
			
			case 'socket':
							imap.connect();
							break;
			default:
							
							break;
		}	
	
	});
	var mails = [];
//	console.log(mailbox);
	imap.connect();
	imap.once('ready', function() {
		imap.openBox('INBOX', false, function(err, box) {});
		
		imap.on('mail', function(arriveMail) {
			console.log('Mail arrived');
			imap.openBox('INBOX', false, function(err, box) {
				if (err) {
//					var err = {'err' : 'not-logged-in'};
					res.json(err);	
					console.log(err);
					return;
				}
				var remainMsg;
				
				var f = imap.seq.fetch(box.messages.total + ':*', {
					bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
					struct: true
				});
				f.on('message', function(msg, seqno) {
	//				console.log('Message #%d', seqno);
	//				var prefix = '(#' + seqno + ') ';
					msg.on('body', function(stream, info) {
						var buffer = '';
						stream.on('data', function(chunk) {
							buffer += chunk.toString('utf8');
						});
						stream.once('end', function() {
							
							mails = Imap.parseHeader(buffer);
							client.emit('mail', { 'mail' : mails, 'seqno': seqno });
						//console.log(mails);
						});
					});
		/*		msg.once('attributes', function(attrs) {
					console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
				});
				msg.once('end', function() {
					console.log(prefix + 'Finished');
				});*/
				});
				f.once('error', function(err) {
					console.log('Fetch error: ' + err);
				});
				f.once('end', function() {
					console.log('Disconnecting');
					
					});
			});
			
		});	
	});
	
	

});


app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
