db.define_table(
	'board',
	Field('title'),
	Field('email'),
	Field('create_time', 'datetime', default=request.now),
	Field('last_active_post'),
	Field('last_active_time', 'datetime', default=request.now),
)

db.define_table(
	'post',
	Field('title'),
	Field('post_content', 'text'),
	Field('email'),
	Field('create_time', 'datetime', default=request.now),
	Field('board', db.board),
)
