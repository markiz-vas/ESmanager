(function () {


    
log = function(type, str) {
  $('<p><span class="label'+(type?' label-'+type:'')+'">'+str+'</span></p>').appendTo('#log')
}

download = function(uri, filePath, cb) {
  var fileTransfer = new FileTransfer();    
  fileTransfer.download(encodeURI(uri), filePath,
    function(entry) {
			if (uri.match(/\.zip$/)) {
				log('success', "download complete: " + entry.fullPath);
				var dest = filePath.split('/').slice(0, -1).join('/')
				zip.unzip(filePath, dest, function(stat) {
					if (stat === 0) {
						log('success', "unpack complete: " + entry.fullPath);
						cb(null, entry)
					} else {
						log('important', "unpack error of file: " + filePath + ",<br/> extracted to: " + dest);
						cb('unpack error')
					}
				})
			} else {
				log('success', "download complete: " + entry.fullPath);
				cb(null, entry)
			}
    },
    function(error) {
      log('important', "download error code: " + error.code + ",<br/> source: " + error.source + ",<br/> target: " + error.target);
      cb(error)
    },
    false,
    {}
  );
}

config = {
	url: 'https://raw.githubusercontent.com/Oziabr/ESmanager/master/project.json'
}

secdl = function(item, count, bar, cb) {
  if(!item.files.length)
    return cb()
  file = item.files.splice(0,1)[0]
  download(item.uri+file, item.path+file, function(err, entry) {
    if(err) return cb(err);	
    progress = 100*(count-item.files.length)/count + '%'
    $('.bar', bar).width(progress)
    secdl(item, count, bar, cb)
  })
}

populate = function() {
  $('.brand').text(config.appTitle)
  config.packs.forEach(function(item, index) {
    var el = $('<button class="btn btn-block btn-primary btn-large" style="margin-top: 5px">'+item.title+'</button>')
    el.appendTo('#main')
    el.click(function(){
        var bar = $('<div class="progress progress-striped active" style="height: 44px; margin-bottom: 0; margin-top: 5px"><div class="bar" style="width: 0%"></div></div>')
        $(this).replaceWith(bar)
        $('.btn-primary').attr('disabled', true)
        secdl(item, item.files.length, bar, function(err) {
          if (err) {
            bar.replaceWith('<button class="btn btn-block btn-danger btn-large" disabled style="margin-top: 5px">Что-то пошло не так ('+item.title+')</button>')
          } else {
            $('#log').empty()
            bar.replaceWith('<button class="btn btn-block btn-success btn-large" disabled style="margin-top: 5px">'+item.title+' (установлен)</button>')
          }
          $('.btn-primary').removeAttr('disabled')
        })
        
      })
  })
}

  document.addEventListener("deviceready", function(){
		$.ajax({
			type: "GET",
			dataType: "json",
			url: config.url + '?' + (new Date()).getTime(),
			success: function(data, status) {
				config = data
				populate()
			},
			error: function(err) {
				log('important', 'Ошибка закрузки конфига: '+config.url)
				log('important', 'Детали: '+JSON.stringify(err))
			},
		});
  })
	
}());