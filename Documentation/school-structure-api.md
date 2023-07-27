# API Documentation
## Create school
Create a school, that has no subscription.

Roles:
 - ADMIN

[POST] /api/school
object 
```
{
	"name":"<School name>",
	"phone":"<Phone number>"
}
```
Responses:
```
{
	"id":"<school id>",
	"name":"<school naùe>",
	"phone":"<phone number>",
	"teacherCode":"<generated code>",
	"studentCode":"<generated code>"
}
```
Operation successfully occurred
 - 400 - Error occurred
 - 401 - Unauthorized
## Get users attached school
[GET] /api/school
Get the school attached to the current logged user
Roles:
 - Admin, Teachers and students
Response
 - ```
{
	"id":"<school id>",
	"name":"<school naùe>",
	"phone":"<phone number>",
	"teacherCode":"<generated code>",
	"studentCode":"<generated code>"
}
```
 Operation successfully occurred
 - 400 - Error occurred
 - 401 - Unauthorized
## Invite an admin
Invites one, or several admins to the attached school
Roles:
 - Admin
[POST]/api/school/invite/admin
```
[
	{
		"email" : "<an email>"
	},
]
```
Response:
 - 200 - Operation successfully occurred
 - 400 - Error occurred
 - 401 - Unauthorized

## Invite a teacher
Invites one, or several teachers to the attached school
Roles:
 - Admin, Teacher
[POST]/api/school/invite/teacher
```
[
	{
		"email" : "<an email>"
	},
]
```
 - 200 - Operation successfuly ocurred
 - 400 - Error occurred
 - 401 - Unauthorized
## Invite a student
Invites one, or several students to the attached school
Roles:
- Admin, Teacher
[POST] /api/school/invite/student
```
{
	"id":"<school id>",
	"email":"<student email>",
}

```
Response 
 - 200 - Operation successfuly ocurred
 - 400 - Error occurred
 - 401 - Unauthorized
## Attach user to school
Create, and attach the student to the given school. The user is active by default.
Roles:
 - NONE
[POST] /api/school?code={school code}
```
{
	"email": "<user email>",
	"password": "<user password>"
}
```
Response:
 - 200 - Log the user or redirect to OAuth0 login page?
 - 400 - Error occurred
 - 401 - Unauthorized

## Rovoke teacher role
Set the teacher activation status
Roles:
 - Admin
[POST] /api/school/teacher
```
{
	"email": "<user email>",
}
```
Response:
 - 200 - Operation successfuly ocurred
 - 400 - Error occured
 - 401 - Unauthorized
## Rovoke student role
Set the teacher activation status
Roles:
 - Admin, Teacher
[POST] /api/school/student
```
{
	"email": "<user email>",
}
```
Response:
 - 200 - Operation successfuly ocurred
 - 400 - Error occured
 - 401 - Unauthorized







