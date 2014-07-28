var express = require('express');
var router = express.Router();
//mail
var fs = require('fs'), fileStream;
var Imap = require('imap'),
    inspect = require('util').inspect;
var StringDecoder = require('string_decoder').StringDecoder;
/* GET home page. */
//s


router.get('/', function(req, res) {
	
	console.log(req.session);
	if(typeof req.session.email === 'undefined' || typeof req.session.password === 'undefined' )
	{
		res.render('index');
	}
	else
	{
		
		res.location('dashboard/INBOX');
		res.redirect('dashboard/INBOX');
	}
});


router.post('/', function(req, res) {

	var email = req.body.iEmail;
	var password = req.body.iPassword;
	console.log(password);
	if(!email || !password) {
		
		return res.render('index', {  error : 'Error: Email and Password required.' });
	}
	
	imap = new Imap({
		user: email,
		password: password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
	});
	
	
	
	imap.once('error', function(err) {
		var error = err.toString();
		switch(err.source) {
			case 'authentication':
							return res.render('index', {  error : error});
							break;
			default:
							console.log(err);
							break;
		}	
	
	});
	 
	imap.connect();
	
	var mails = {};
	//console.log(imap);

	imap.once('ready', function() {
		if(!req.session.email || !req.session.password) {
//			req.session.regenerate();
			req.session.email = email;
			req.session.password = password;
		}
	
	res.location('dashboard/INBOX');
	res.redirect('dashboard/INBOX');
		
});
});

router.all('/logout', function(req, res) {
	
	console.log(req.session);
	if(typeof req.session.email === 'undefined' || typeof req.session.password === 'undefined' )
	{
		res.location('/');
		res.redirect('/');
	}
	else
	{
		req.session.destroy(function(err) {
			if(err) {
				console.log('Error: Logging out. Try again.');
				
			}
			else {
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

router.all('/api/:option?/:mailbox?/:mailno?', function(req, res) {
	
	if(typeof req.session.email === 'undefined' || typeof req.session.password === 'undefined' ) {
		
		var err = {'err' : 'not-logged-in'};
		res.json(err);
	
	}
	else {
		if(req.params.option === 'getBoxes') {
		
			getBoxes(req, res);
		}
		else if(req.params.option === 'mail') {
			
				if(req.params.mailno !== 'undefined' && req.params.mailbox !== 'undefined') {
				
					showMail(req, res);
				}
			
		}
		
	}

});

router.all('/mail/:mailbox?/:page?', function(req, res) {
	
	if(typeof req.session.email === 'undefined' || typeof req.session.password === 'undefined' ) {
		
		var err = {'err' : 'not-logged-in'};
		res.json(err);	
	}
	else {
	
		openInbox(req, res);
	}

});

router.all('/dashboard/:mailbox?/:mailNo?', function(req, res) {

	if(typeof req.session.email === 'undefined' || typeof req.session.password === 'undefined' ) {
		
		res.location('/');
		res.redirect('/');
	
	}
	else
	{		
		res.render('dashboard', { username : req.session.email });
	}
});

function getBoxes(req, res) {
	
	imap = new Imap({
		user: req.session.email,
		password: req.session.password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
		});
		
	imap.once('error', function(err) {
		var error = err.toString();
		switch(err.source) {
			case 'authentication':
							return res.redirect('index', {  error : error});
							break;
			case 'timeout-auth':
			
			case 'timeout':
			
			case 'socket':
							imap.connect();
							break;
			default:
							console.log(err);
							break;
		}	
	
	});
	
//	console.log(mailbox);
	imap.connect();
	
	var boxes = {};
	//console.log(imap);

	function maildata(rvalue){
		imap.once('ready', function() {
			imap.getBoxes(function(err, boxes) {
				if (err) {
					console.log(err);
					return;
				}
				imap.end();
				rvalue(boxes);
				
			});
			
		});
	};
	
	maildata(function(data) {
		var mailBoxes = Object.keys(data['[Gmail]'].children);
//		console.log(data);
		res.send(mailBoxes);
	});
	
}
		


function openInbox(req, res) {
	
	if(typeof req.params.mailbox === 'undefined') {
		mailbox = 'INBOX';	
	}
	else {
		mailbox = decodeURIComponent(req.params.mailbox);
		console.log(mailbox);
	}
	var temp = Number(req.params.page);
	if(typeof req.params.page === 'undefined' || typeof temp !== 'number' || temp < 0) {
	
		var page = 0;
	}
	else {
		var page = parseInt(decodeURIComponent(req.params.page));
	}
	 console.log(page);
	
	imap = new Imap({
		user: req.session.email,
		password: req.session.password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
		});
		
	imap.on('error', function(err) {
		var error = err.toString();
		console.log(err);
		switch(err.source) {
			case 'authentication':
							return res.redirect('index', {  error : error});
							break;
			case 'timeout-auth':
			
			case 'timeout':
			
			case 'socket':
							imap.connect();
							break;
			default:
							
							break;
		}	
	
	});
	
//	console.log(mailbox);
	imap.connect();
	
	var mails = {};
	//console.log(imap);

	function maildata(rvalue){
		imap.once('ready', function() {
			imap.openBox(mailbox, false, function(err, box) {
				if (err) {
//					var err = {'err' : 'not-logged-in'};
					res.json(err);	
					console.log(err);
					return;
				}
				
				if(box.messages.total === 0) {
					rvalue({ 'err' : 'no-mail' });
					return;
				}
				else if(box.messages.total < 50) {
					var msgSrc = box.messages.total + ':1';
				}
				else if((box.messages.total - (page + 1)*50) < 0) {
					var msgSrc = (box.messages.total - page*50) + ':1';

				} 
				else {
					var msgSrc = (box.messages.total - (page + 1)*50) + ':' + (box.messages.total - page*50) ;				
				}
				console.log(msgSrc);
				var f = imap.seq.fetch(msgSrc, {
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
							mails[seqno] = Imap.parseHeader(buffer);
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
//					imap.end();
					rvalue(mails);
				});
			});
			
		});
	};
	
	maildata(function(data) {
		res.send(data);
	});
	
}





function showMail(req, res) {
	
	if(typeof req.params.mailbox !== 'undefined') {
	
		var mailbox =  decodeURIComponent(req.params.mailbox);
	}
	else {
		var mailbox = 'INBOX';
	}
	
	if(typeof req.params.mailno !== 'undefined') {
	
		var msgNo = decodeURIComponent(req.params.mailno);
	}
	
	imap = new Imap({
		user: req.session.email,
		password: req.session.password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
		});
		
	imap.once('error', function(err) {
		var error = err.toString();
		console.log(err);
		switch(err.source) {
			case 'authentication':
							return res.redirect('index', {  error : error});
							break;
			case 'timeout-auth':
							
			case 'timeout':
			
			case 'socket':
							imap.connect();
							break;
			case 'protocol':
							break;
			default:
							console.log(err);
							break;
		}	
	
	});
//			res.set('Content-Type', 'text/html');

//	console.log(mailbox);
	imap.connect();
	function findTextPart(struct) {
		for (var i = 0, len = struct.length, r; i < len; ++i) {
			if (Array.isArray(struct[i])) {
				if (r = findTextPart(struct[i]))
					return r;
				} else if (struct[i].type === 'text'
						&& (struct[i].subtype === 'plain' || struct[i].subtype === 'html')) {
							if(typeof struct[i].encoding === 'undefined' || struct[i].encoding === '') {
							return [struct[i].partID, struct[i].type + '/' + struct[i].subtype, ''];
							}
							else {
								return [struct[i].partID, struct[i].type + '/' + struct[i].subtype, struct[i].encoding];
						}
					}
		}
	}
	
	var mail, mail2;
	//console.log(imap);
	var decoder = new StringDecoder('utf-8');
	var partID;
	function maildata(rvalue){
		imap.once('ready', function() {
			imap.openBox(mailbox, false, function(err, box) {
				if (err) {
//					var err = {'err' : 'not-logged-in'};
					res.json(err);	
					console.log(err);
					return;
				}
				var bodyP;
				console.log(msgNo);
				var msgAttr = imap.seq.fetch(msgNo, {
					struct: true,
				});
				msgAttr.on('message', function(msg, seqno) {
	//				console.log('Message #%d', seqno);
	//				var prefix = '(#' + seqno + ') ';
					msg.once('attributes', function(attrs) {
						console.log(attrs.struct);
						partID = findTextPart(attrs.struct);
						console.log(partID);
						if(typeof partID !== 'undefined') {
							getBody(partID);
							
							console.log(partID);
							
						}
						else {
							rvalue('No Body');
						}
					});
				});
				
				
//				console.log(bodyPart);
				function getBody(bodyPart){
					var part = parseInt(bodyPart[0].toString());
					var msgBody = imap.seq.fetch(msgNo, {
						bodies: part,
						struct : false,
					});
					mail2 = '';
					msgBody.on('message', function(m, sn) {
						m.on('body', function(stream, info) {
							console.log(stream);
						//	if (info.which === 'TEXT')
							//	console.log('Body [%s] found, %d total bytes', inspect(info.which), info.size);
							var buffer = '', count = 0;
							stream.on('data', function(chunk) {
								count += chunk.length;
								buffer += chunk.toString();
							
							//	if (info.which === 'TEXT')
							//		console.log('Body [%s] (%d/%d)', inspect(info.which), count, info.size);
							});
							stream.once('end', function() {
								mail = buffer;
								mail2 += decoder.write(buffer);
								console.log(mail2);
						/*		if (info.which !== 'TEXT')
							//		console.log('Parsed header: %s', inspect(Imap.parseHeader(buffer)));
								else
									console.log('Body [%s] Finished', inspect(info.which));*/
							});
						});
					
/*
					msg.once('end', function() {
						console.log(prefix + 'Finished');
					});*/
					});
					msgBody.once('error', function(err) {
						console.log('Fetch error: ' + err);
					});
					msgBody.once('end', function() {
						console.log('Disconnecting');
						imap.end();
						if(mail2 !== '') {
							if(typeof bodyPart[2] !== 'undefined' || bodyPart[2] !== '') {
								switch(bodyPart[2]) {
									case 'BASE64':
										mail2 = atob(mail2.slice(9));
										rvalue(mail2);
									default:
										rvalue(mail2.slice(9));	
								}											
							}
							else {
								rvalue(mail2.slice(9));
							}
						}
						else
							rvalue('No Body');
					});
				}
			});
			
		});
	};
	
	maildata(function(data) {
		res.set('Content-Type', 'text/html');
		data = '<pre>' + data + '</pre>';
		res.send(data);
	});
	
}


module.exports = router;