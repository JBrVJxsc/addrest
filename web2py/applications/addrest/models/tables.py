db.define_table(
	'address',
	Field('user_id', 'integer'),
	Field('email'),
	Field('address_info_id', 'integer'),
	Field('available', 'boolean', default=True),
	Field('create_time', 'datetime', default=request.now),
)

db.define_table(
	'address_info',
	Field('first_name'),
	Field('last_name'),
	Field('company'),
	Field('area'),
	Field('phone'),
	Field('street'),
	Field('apt'),
	Field('city'),
	Field('address_state'),
	Field('zip'),
)

db.define_table(
	'settings',
	Field('user_id', 'integer'),
	Field('available', 'boolean', default=True),
)
