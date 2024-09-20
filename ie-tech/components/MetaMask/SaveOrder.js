import Stripe from 'stripe';
import connPromise from '../../../database/connect';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const connection = await connPromise;
            const { total, user_id, plan_id, duration } = JSON.parse(req.body);



            // check if payment is successful
            // save payment to database
            const order_status = 'Thành công';
            /*
            const query =
                'INSERT INTO orders (user_id, plan_id, duration, total, status) VALUES ("' +
                user_id +
                '", "' +
                plan_id +
                '", "' +
                duration +
                '", "' +
                total +
                '", "' +
                order_status +
                '");';

            await connection.execute(query);
            */
            
            res.status(200).json({ message: 'Lưu thành công', success: true });
        } catch (e) {
            res.status(500).json({ message: e.message, success: false });
        }
    } else res.setHeader('Allow', 'POST');
}
