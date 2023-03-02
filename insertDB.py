import xlrd
import pymysql

# pip install xlrd==1.2.0
# pip install pymysql

FilePath = '/Users/atom/Downloads/0207.xls'


def xlsToDB():
    # Use a breakpoint in the code line below to debug your script.
    # 1.打开excel文件
    wkb = xlrd.open_workbook(FilePath)
    # 2.获取sheet
    sheet = wkb.sheet_by_index(0)  # 获取第一个表['支付信息']
    # 3.获取总行数
    rows_number = sheet.nrows
    # 4.遍历sheet表中所有行的数据，并保存至一个空列表cap[]
    # cap = []
    for i in range(1, rows_number):
    # for i in range(1, 3):
        x = sheet.row_values(i)  # 获取第i行的值（从0开始算起）
        dbinsert(x)


def dbinsert(user):
    # 打开数据库连接
    conn = pymysql.connect(
        host='localhost',  # MySQL服务器地址
        user='root',  # MySQL服务器端口号
        password='12345678',  # 用户名
        charset='utf8',  # 密码
        port=3306,  # 端口
        db='storeDB',  # 数据库名称
    )

    # 使用cursor()方法获取操作游标
    c = conn.cursor()

    phone = user[8] if isinstance(user[8],str) else str(int(user[8]))
    sql = """insert into user_info(card_id,cvv,user_name,address,city,provinces,postal,cty,phone,email_add)
    value ("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s")""" % (
        user[0], user[1], user[2], user[3], user[4], user[5], user[6], user[7], phone, user[9])

    # 使用execute方法执行SQL语句
    c.execute(sql)
    conn.commit()
    # 关闭数据库连接
    conn.close()

if __name__ == '__main__':
    xlsToDB()
