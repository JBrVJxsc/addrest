from datetime import date


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


@auth.requires_login()
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


def login():
    result = Auth(db=db).login_bare(request.vars.email, request.vars.password)
    return locals()


def signup():
    result = Auth(db=db).register_bare(**request.vars)
    return locals()


def logout():
    result = Auth(db=db).logout(next=None)
    return locals()


def board():
    b = db(db.board.id == request.args(0)).select().first()
    if b:
        return dict(board_title=b.title)
    else:
        redirect(URL('default', 'index'))


def get_boards():
    rows = db().select(db.board.ALL, limitby=(0, int(request.vars.number)), orderby=~db.board.last_active_time)
    boards = []
    today = date.today()
    for row in rows:
        all_posts = db(db.post.board == row.id).select(orderby=~db.post.last_active_time)
        today_posts = db(
            (db.post.board == row.id) &
            (db.post.create_time.year() == today.year) &
            (db.post.create_time.month() == today.month) &
            (db.post.create_time.day() == today.day)
        ).select(orderby=~db.post.create_time)
        last_post = all_posts.first()
        b = {
            'id': row.id,
            'title': row.title,
            'email': row.email,
            'create_time': row.create_time,
            'last_active_time': row.last_active_time,
            'last_post_id': last_post.id if last_post else '',
            'last_post_title': last_post.title if last_post else '',
            'all_posts_number': len(all_posts),
            'today_posts_number': len(today_posts),
            'show': True
        }
        boards.append(b)
    return {
        'result': {
            'boards': boards,
            'user': auth.user,
        }
    }


@auth.requires_signature()
def create_board():
    rows = db(db.board.title == request.vars.title).select()
    if len(rows) > 0:
        return {
            'result': {
                'state': False,
            }
        }
    b = {
        'title': request.vars.title,
        'email': auth.user.email
    }
    board_id = db.board.insert(**b)
    b = {
        'title': "Greeting!",
        'post_content': "Welcome, %s!\n"
                        "You are the creator of this board!\n"
                        "Now create your own posts :)" % auth.user.email,
        'board': board_id,
    }
    db.post.insert(**b)
    return {
        'result': {
            'id': board_id,
        }
    }


@auth.requires_signature()
def edit_board():
    rows = db(db.board.title == request.vars.title).select()
    if len(rows) > 0:
        return {
            'result': {
                'state': False,
            }
        }
    db(db.board.id == request.vars.id).update(title=request.vars.title)
    return {
        'result': {
            'state': True,
        }
    }


@auth.requires_signature()
def delete_board():
    db(db.board.id == request.vars.id).delete()
    return {
        'result': {
            'state': True,
        },
    }


def get_posts():
    rows = db(db.post.board == request.vars.board).select(db.post.ALL, limitby=(0, int(request.vars.number)), orderby=~db.post.last_active_time)
    posts = []
    for row in rows:
        p = {
            'id': row.id,
            'title': row.title,
            'post_content': row.post_content,
            'email': row.email,
            'board': row.board,
            'create_time': row.create_time,
            'last_active_time': row.last_active_time,
            'show': True
        }
        posts.append(p)
    return {
        'result': {
            'posts': posts,
            'user': auth.user,
        }
    }


@auth.requires_signature()
def create_post():
    p = {
        'title': request.vars.title,
        'post_content': request.vars.post_content,
        'email': auth.user.email,
        'board': request.vars.board,
    }
    post_id = db.post.insert(**p)
    db(db.board.id == request.vars.board).update(last_active_time=request.now)
    return {
        'result': {
            'id': post_id,
        },
    }


@auth.requires_signature()
def edit_post():
    p = {
        'title': request.vars.title,
        'post_content': request.vars.post_content,
        'last_active_time': request.now
    }
    db(db.post.id == request.vars.id).update(**p)
    db(db.board.id == request.vars.board).update(last_active_time=request.now)
    return {
        'result': {
            'state': True,
        },
    }


@auth.requires_signature()
def delete_post():
    db(db.post.id == request.vars.id).delete()
    return {
        'result': {
            'state': True,
        },
    }


@auth.requires_login()
def get_post_api():
    create = URL('default', 'create_post.json', user_signature=True)
    edit = URL('default', 'edit_post.json', user_signature=True)
    delete = URL('default', 'delete_post.json', user_signature=True)
    return locals()


@auth.requires_login()
def get_board_api():
    create = URL('default', 'create_board.json', user_signature=True)
    edit = URL('default', 'edit_board.json', user_signature=True)
    delete = URL('default', 'delete_board.json', user_signature=True)
    return locals()


def create_demo():
    boards_number = 1
    posts_number = 50
    for i in xrange(boards_number):
        if boards_number == 1:
            db.board.insert(title="Pagination Demo")
        else:
            db.board.insert(title="Pagination Demo #%d" % i)
    rows = db().select(db.board.ALL, orderby=~db.board.last_active_time)
    for row in rows:
        for i in xrange(posts_number):
            db.post.insert(
                title="Try pagination here!" if i == 0 else "Demo Post #%d" % i,
                post_content='Please click "Show more" at bottom to get more posts.\n'
                             'You cannot modify these posts since you are not author, '
                             'please sign up and create yours :)' if i == 0 else "#%d" % i,
                board=row.id
            )
    redirect(URL('default', 'index'))
