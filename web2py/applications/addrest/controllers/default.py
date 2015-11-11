def index():
    # If user has been logged in already, then
    # redirect to dashboard.
    if auth.user:
        redirect('dashboard')
    return dict()


def dashboard():
    # If user has not been logged in, then
    # redirect to index.
    if not auth.user:
        redirect('/')
    return dict()


def get_user():
    return {
        'result': {
            'user': auth.user,
        }
    }


def login():
    result = Auth(db=db).login_bare(request.vars.email, request.vars.password)
    return locals()


def signup():
    result = Auth(db=db).register_bare(**request.vars)
    return locals()


def logout():
    result = Auth(db=db).logout(next=None)
    return locals()


def query():
    rows = db(db.address.email == request.vars.email).select(db.address.ALL, orderby=~db.address.create_time)
    addresses = []
    for row in rows:
        info_rows = db(db.address_info.id == row.address_info_id).select()
        for info in info_rows:
            if row.available:
                address = {
                    'first_name': get_mask(info.first_name),
                    'last_name': get_mask(info.last_name),
                    'company': get_mask(info.company),
                    'area': get_mask(info.area),
                    'phone': info.phone[-4:].rjust(len(info.phone), "*"),
                    'street': get_mask(info.street),
                    'apt': get_mask(info.apt),
                    'city': info.city,
                    'state': info.address_state,
                    'zip': info.zip
                }
                addresses.append(address)
    return {
        'result': {
            'addresses': addresses,
        }
    }


def get_mask(s):
    l = len(s)
    if l == 0:
        return ''
    return s[0] + '*' * (l - 1)


def get_info():
    users = len(db().select(db.auth_user.id))
    addresses = len(db().select(db.address_info.id))
    return locals()


@auth.requires_signature()
def get_api():
    get_list_api = URL('default', 'get_addresses', user_signature=True)
    create = URL('default', 'create_address', user_signature=True)
    edit = URL('default', 'edit_address', user_signature=True)
    delete = URL('default', 'delete_address', user_signature=True)
    return locals()


@auth.requires_signature()
def get_addresses():
    rows = db(db.address.user_id == auth.user.id).select(db.address.ALL, orderby=~db.address.create_time)
    addresses = []
    for row in rows:
        info_rows = db(db.address_info.id == row.address_info_id).select()
        for info in info_rows:
            address = {
                'show': True,
                'id': row.id,
                'available': row.available,
                'first_name': info.first_name,
                'last_name': info.last_name,
                'company': info.company,
                'area': info.area,
                'phone': info.phone,
                'street': info.street,
                'apt': info.apt,
                'city': info.city,
                'state': info.address_state,
                'zip': info.zip
            }
            addresses.append(address)
    return {
        'result': {
            'addresses': addresses,
        }
    }


@auth.requires_signature()
def create_address():
    address_info = {
        'first_name': request.vars.first_name,
        'last_name': request.vars.last_name,
        'company': request.vars.company,
        'area': request.vars.area,
        'phone': request.vars.phone,
        'street': request.vars.street,
        'apt': request.vars.apt,
        'city': request.vars.city,
        'address_state': request.vars.state,
        'zip': request.vars.zip,
    }
    address_info_id = db.address_info.insert(**address_info)
    address = {
        'user_id': auth.user.id,
        'email': auth.user.email,
        'address_info_id': address_info_id,
    }
    address_id = db.address.insert(**address)
    return {
        'result': {
            'id': address_id,
        }
    }


@auth.requires_signature()
def edit_address():
    db(db.address.id == request.vars.id).update(available=request.vars.available)
    rows = db(db.address.id == request.vars.id).select()
    for row in rows:
        address_info = {
            'first_name': request.vars.first_name,
            'last_name': request.vars.last_name,
            'company': request.vars.company,
            'area': request.vars.area,
            'phone': request.vars.phone,
            'street': request.vars.street,
            'apt': request.vars.apt,
            'city': request.vars.city,
            'address_state': request.vars.state,
            'zip': request.vars.zip,
        }
        db(db.address_info.id == row.address_info_id).update(**address_info)
    return {
        'result': {
            'state': True,
        }
    }


@auth.requires_signature()
def delete_address():
    print "deleting", request.vars
    rows = db(db.address.id == request.vars.id).select()
    print rows
    for row in rows:
        db(db.address_info.id == row.address_info_id).delete()
    db(db.address.id == request.vars.id).delete()
    return {
        'result': {
            'state': True,
        },
    }


def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/manage_users (requires membership in
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()
