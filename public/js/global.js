
$(document).ready(function() {
	getBoxes();
	var path = location.pathname;
	
	var options = path.split('/');
	var mailNo = Number(options[3]);
	if(typeof options[3] !== 'undefined' && typeof mailNo === 'number' && mailNo > 0 ) {
//			page = options[1];
			if(options[2] !== 'INBOX' && options[2] !== '') {
				$('table#mails').attr('mailBox', options[2]);
			}
			else {
				if(options[2] === '') {
					$('table#mails').attr('mailBox','INBOX');
			}
			else {
				$('table#mails').attr('mailBox', options[2]);
			}
		}
			showMail();
	}
	else {
		populateTable();

	}

	
	$('#boxes').on('click', 'li.showBox a', showBox);
	
	$('#mails tbody').on('click', 'tr.showMail', showMail);
	$('#mails tbody').on('click', 'td button.changePage', changePage);
	$('#mails tbody').on('click', 'button.#back', changePage);
	

});

function populateTable() {

//	var mailBox, page;
	var path = location.pathname;
	
	var options = path.split('/');
	var apiLink = '/mail';
	console.log(options);
	console.log($('table#mails').attr('page'));
	if(typeof options[2] !== 'undefined') {
//		$('table#mails').attr('mailBox', options[2]);
//		mailBox = options[0];
		if(options[2] !== 'INBOX' && options[2] !== '') {
			apiLink += '/[Gmail]' + encodeURIComponent('/' + options[2]);
			$('table#mails').attr('mailBox', options[2]);
		}
		else {
			if(options[2] === '') {
				apiLink += '/' + encodeURIComponent('INBOX');
				$('table#mails').attr('mailBox','INBOX');
			}
			else {
				apiLink += '/' + encodeURIComponent(options[2]);
				$('table#mails').attr('mailBox', options[2]);
			}
		}
		page = Number($('table#mails').attr('page'));
		if(typeof page !== 'undefined' && typeof page === 'number' && page > 0 ) {
//			page = options[1];
			apiLink += '/' + encodeURIComponent(page);
		}
		else {
			page = 0;
		}
	}
	console.log(apiLink);
	var tableContent = '';
	var keys;
	$.getJSON( apiLink,  function(data) {
		
		if(typeof data['err'] !== 'undefined' && data['err'] === 'not-logged-in') {
			top.location('/');
		}
		else if(typeof data['err'] !== 'undefined' && data['err'] === 'no-mail'){
			
			tableContent += '<tr>';
			tableContent += '<td>No Mails</td>';
			tableContent += '</tr>';
			$('#mails tbody').html(tableContent);
		}
		else{
			keys = Object.keys(data);
			console.log(keys.length);
			for (var i = keys.length-1; i >= 0; i--) {
				var key = keys[i];
//				$.each(data, function(key) {
	//			var reGex = '/\"\[(.*?)\"\]/g';
	//			var reGex2 = '/<(.*?)>/g';
//				console.log(data[key]);
//				console.log(data[key]['from'][0]);
				var senderEmail = data[key]['from'][0].match(/\<(.*?)\>/g);
				if(senderEmail === null) {
					senderEmail = data[key]['from'];
				}
				else {
//					console.log(senderEmail);
					senderEmail = senderEmail[0].split('<');
					senderEmail = senderEmail[1].split('>')[0];
				}
				
//				console.log(senderEmail);
				var subject = data[key]['subject'][0];
				var date = new Date(data[key]['date'][0]);
				var readDate = date.toDateString().substring(4);
				
			
				tableContent += '<tr rel="' + key + '" class="showMail">';
				tableContent += '<td>' + senderEmail + '</td>';
				tableContent += '<td>' + subject + '</td>';
				tableContent += '<td>' + readDate + '</td>';
				tableContent += '</tr>';
				
				
//				console.log(tableContent);
			}
			tableContent += '<tr class="pull-right">';
			tableContent += '<td colspan="3"><div class="btn-group">';
			if(page !== 0) {
				tableContent += '<button type="button" class="btn btn-default changePage" id="prevPage">Previous</button>';
			}
			else {
				tableContent += '<button type="button" class="btn btn-default" disabled="disabled">Previous</button>';
			}
			if(keys.length === 51) {
				tableContent += '<button type="button" class="btn btn-default changePage" id="nextPage">Next</button>';
			}
			else {
				tableContent += '<button type="button" class="btn btn-default" disabled="disabled">Next</button>';
			}
			tableContent += '</div></td></tr>';
			$('#mails tbody').html(tableContent);
		}
		
		
	});
};		

function changePage(event) {

//	var mailBox, page;
	event.preventDefault();
	
	var page;
	var id = $(this).attr('id');
	var path = location.pathname;
	
	var options = path.split('/');
	var apiLink = '/mail'
//	var currentPage = path.split('/');
	var currentPage = Number($('table#mails').attr('page'));
	console.log(currentPage);
	if(id === 'prevPage'){
		
		if(typeof currentPage !== 'undefined' || typeof currentPage === 'number' || currentPage >= 0) {
			//history.pushState({}, '', '/dashboard/INBOX/' + (currentPage - 1));
			page = currentPage - 1;
		}
		else {
			return;
		}
	}
	else if( id === 'nextPage') {
		if(typeof currentPage !== 'undefined' || typeof currentPage === 'number' || currentPage >= 0) {
			
			//history.pushState({}, '', '/dashboard/INBOX/' + (currentPage + 1));
			page = currentPage + 1;
		}
		else {
			return;
		}
	
	}
	else if(id ==='back') {
			console.log(options[2]);
			history.pushState({}, '', '/dashboard/' + encodeURIComponent(options[2]));
			page = currentPage;
	}
		
	;
	console.log(options);
	if(typeof options[2] !== 'undefined') {
		
//		mailBox = options[0];
		if(options[2] !== 'INBOX') {
			apiLink += '/[Gmail]' + encodeURIComponent('/' + options[2]);
		}
		else {
			apiLink += '/' + encodeURIComponent(options[2]);
		}
//		page = Number(options[3]);
		if(typeof page !== 'undefined' && typeof page === 'number' && page > 0 ) {
//			page = options[1];
			apiLink += '/' + encodeURIComponent(page);
		}
		else {
			page = 0;
		}
	}
	console.log(apiLink);
	var tableContent = '';
	var keys;
	$.getJSON( apiLink,  function(data) {
		keys = Object.keys(data);
		console.log(data);
		 if(typeof data['err'] !== 'undefined' && data['err'] === 'not-logged-in') {
			window.history.go('/');
		}
		else {

			for (var i = keys.length-1; i >= 0; i--) {
				var key = keys[i];
//				$.each(data, function(key) {
				var reGex = '/\"\[(.*?)\"\]/g';
				var reGex2 = '/<(.*?)>/g';
//				console.log(data[key]);
//				console.log(data[key]['from'][0]);
				var senderEmail = data[key]['from'][0].match(/\<(.*?)\>/g);
				if(senderEmail === null) {
					senderEmail = data[key]['from'];
				}
				else {
//					console.log(senderEmail);
					senderEmail = senderEmail[0].split('<');
					senderEmail = senderEmail[1].split('>')[0];
				}
			
//				console.log(senderEmail);
				var subject = data[key]['subject'][0];
				var date = new Date(data[key]['date'][0]);
				var readDate = date.toDateString().substring(4);
				
			
				tableContent += '<tr rel="' + key + '" class="showMail">';
				tableContent += '<td>' + senderEmail + '</td>';
				tableContent += '<td>' + subject + '</td>';
				tableContent += '<td>' + readDate + '</td>';
				tableContent += '</tr>';
				
//			console.log(tableContent);
			}
			tableContent += '<tr class="pull-right">';
			tableContent += '<td colspan="3"><div class="btn-group">';
			if(page !== 0) {
				tableContent += '<button type="button" class="btn btn-default changePage" id="prevPage">Previous</button>';
			}
			else {
				tableContent += '<button type="button" class="btn btn-default" disabled="disabled">Previous</button>';
			}
			if(keys.length === 51) {
				tableContent += '<button type="button" class="btn btn-default changePage" id="nextPage">Next</button>';
			}
			else {
				tableContent += '<button type="button" class="btn btn-default" disabled="disabled">Next</button>';
			}
			tableContent += '</div></td></tr>';
			$('table#mails').attr('page', page);
			$('#mails tbody').html(tableContent);
		}
	});
};	

function showBox() {

	event.preventDefault();
	
	var box = $(this).attr('href');
	
	history.pushState({}, '', box);
//	var mailBox, page;
	var path = location.pathname;
	
	var options = path.split('/');
	var apiLink = '/mail';
	console.log(options);
	if(typeof options[2] !== 'undefined') {
		
//		mailBox = options[0];
		if(options[2] !== 'INBOX') {
			apiLink += '/[Gmail]' + encodeURIComponent('/' + options[2]);
		}
		else {
			apiLink += '/' + encodeURIComponent(options[2]);
		}
		
	}
	console.log(apiLink);
	
	var tableContent = '';
	
	$.getJSON( apiLink,  function(data) {
		$.each(data, function(key) {
			
			if(typeof data['err'] !== 'undefined' && data['err'] === 'not-logged-in') {
				top.location('/');
			}
			else if(typeof data['err'] !== 'undefined' && data['err'] === 'No Mail'){
				
				tableContent += '<tr rel="">';
				tableContent += '<td>No Mails</td>';
				tableContent += '</tr>';
				$('#mails tbody').html(tableContent);
			}
			else{
				console.log(data);
				keys = Object.keys(data);
				for (var i = keys.length-1; i >= 0; i--) {
					var key = keys[i];
	//				$.each(data, function(key) {
	//				var reGex = '/\"\[(.*?)\"\]/g';
	//				var reGex2 = '/<(.*?)>/g';
	//				console.log(data[key]);
	//				console.log(data[key]['from'][0]);
					var senderEmail = data[key]['from'][0].match(/\<(.*?)\>/g);
					if(senderEmail === null) {
						senderEmail = data[key]['from'];
					}
					else {
//						console.log(senderEmail);
						senderEmail = senderEmail[0].split('<');
						senderEmail = senderEmail[1].split('>')[0];
					}
				
	//				console.log(senderEmail);
					var subject = data[key]['subject'][0];
					var date = new Date(data[key]['date'][0]);
					var readDate = date.toDateString().substring(4);
				
			
					tableContent += '<tr rel="' + key + '" class="showMail">';
					tableContent += '<td>' + senderEmail + '</td>';
					tableContent += '<td>' + subject + '</td>';
					tableContent += '<td>' + readDate + '</td>';
					tableContent += '</tr>';
				
	//			console.log(tableContent);
				}
			}
		});
		$('table#mails').attr('mailBox', options[2]);
		$('table#mails').attr('page', 0);
		$('#mails tbody').html(tableContent);
	});
};			

function showMail(event) {
	
	
	
	var path = location.pathname;
	
	var options = path.split('/');
	var mailNo = Number(options[3]);
	
	
	var mailSeqNo = event ? $(this).attr('rel') : mailNo;
	
	if(typeof $(this).attr('mail') !== 'undefined') {
		var mailBox = 'INBOX';
	}
	else {
		var mailBox = $('table#mails').attr('mailBox');
	}
//	var mailData = [];
/*	$(this).children().each(function() {
		mailData.push($(this).html());
	});*/
//	console.log(mailData);
	
	if(event) {
		event.preventDefault();
		var path = location.pathname;
		if(typeof options[3] === 'undefined' || options[3] === '') { 
			console.log('url changed');
			history.pushState({}, '', '/dashboard/' + mailBox + '/' + mailSeqNo);
		}
	}

	if(typeof mailBox !== 'undefined') {
		if(mailBox !== 'INBOX') {
			mailBox = '[Gmail]' + encodeURIComponent('/' + mailBox);
		}
		else {
			mailBox = encodeURIComponent(options[2]);
		}
		var apiLink = '/api/mail/' + mailBox + '/' + mailSeqNo;
	}
	
	console.log(apiLink);
	var tableContent = '';
	

	$.get( apiLink,  function(data) {
		 
		 if(typeof data['err'] !== 'undefined' && data['err'] === 'not-logged-in') {
			window.history.go('/');
		}
		else {
			tableContent += '<div><button type="button" class="btn btn-default" id="back">Back</button></div><br>';
//			tableContent += '<div><p>From : ' + mailData[0] + '<br>Subject : ' + mailData[1] + '<br>Date : ' + mailData[2] + '</p></div>';
			tableContent += '<hr>';
			tableContent += '<div>';
			tableContent += data;
			tableContent += '</div>';
			$('#mails tbody').html(tableContent);
//			console.log(tableContent);
		}
		
	});
	
	
	
};


function getBoxes() {
	
	
	var apiLink = '/api/getBoxes';
	
	
	var tableContent = '';
	
	$.getJSON( apiLink,  function(data) {
		console.log(data);
		$.each(data, function(index, value) {
			
		   
				tableContent = '<li class="showBox">';
				tableContent += '<a href="/dashboard/'+ encodeURI(value) +'">' + value + '</a>';
			
				$('#boxes').append(tableContent);
			
		});
		
//		$('#mails tbody').html(tableContent);*/
	});
	
	
	
};

