# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a sample controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
#########################################################################
from datetime import date


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    response.flash = T("Hello World")
    return dict(message=T('Welcome to web2py!'))


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
    return dict()


def get_boards():
    rows = db().select(db.board.ALL, orderby=~db.board.last_active_time)
    boards = []
    today = date.today()
    for row in rows:
        all_posts = db(db.post.board == row.id).select(orderby=~db.post.create_time)
        today_post = db(
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
            'today_posts_number': len(today_post),
            'show': True
        }
        boards.append(b)
    return {
        'result': {
            'boards': boards,
            'user': auth.user,
        }
    }


def delete_board():
    db(db.board.id == request.vars.id).delete()
    return {
        'result': {
            'state': True,
        }
    }


def create_board_num():
    for i in xrange(int(request.vars.num)):
        db.board.insert(**dict(title=i))


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
    db.board.insert(**b)
    return {
        'result': {
            'state': True,
        }
    }


def edit_board():
    rows = db(db.board.title == request.vars.title).select()
    if len(rows) > 0:
        return {
            'result': {
                'state': False,
            }
        }
    info = request.vars
    db(db.board.id == info.id).update(title=info.title)
    return {
        'result': {
            'state': True,
        }
    }


def create_post():
    post = {
        'title': str(request.now),
        'email': auth.user.email,
        'post_content': str(request.now),
        'board': 3,
    }
    db.post.insert(**post)
    return {
        'result': {
            'state': True,
        }
    }


def get_posts():
    rows = db(db.post.board == '1').select()
    print rows


def get_post():
    print request.args
    pass
