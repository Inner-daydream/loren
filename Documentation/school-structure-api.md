# API Documentation

//Create a school
[AUTHORIZED-ADMIN-POST] /api/school
object 
```{
	"name":"<School name>",
	"phone":"<Phone number>"
}
```
Response
```
{
	"id":"<school id>",
	"name":"<school naùe>",
	"phone":"<phone number>",
	"teacherCode":"<generated code>",
	"studentCode":"<generated code>"
}
```
[AUTHORIZED-GET] /api/school
Response
```
{
	"id":"<school id>",
	"name":"<school naùe>",
	"phone":"<phone number>",
	"teacherCode":"<generated code>",
	"studentCode":"<generated code>"
}
```
[AUTHORIZED-POST]/api/school/invite/admin

```[
	{
		"email" : "<an email>"
	},
]
```
[AUTHORIZED-POST]/api/school/invite/teacher
```
[
	{
		"email" : "<an email>"
	},
]
```
```
[ANONYMOUS-GET] /api/school?code={school code}
{
	"id":"<school id>",
	"name":"<school naùe>",
}
```
[ANONYMOUS-POST] /api/school/invite/student
```  {
	"id":"<school id>",
	"email":"<student email>",
}
```





