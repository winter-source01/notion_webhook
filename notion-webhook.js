const crypto = require('crypto');

exports.handler = async (event, context) => {
  console.log('Webhook received:', {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body
  });

  // 노션 웹훅 서명 검증
  const signature = event.headers['notion-webhook-signature'];
  const timestamp = event.headers['notion-webhook-timestamp'];
  const body = event.body || '';

  // 웹훅 시크릿 (환경 변수에서 가져오기)
  const webhookSecret = process.env.NOTION_WEBHOOK_SECRET || 'your-webhook-secret';

  if (signature && timestamp) {
    // 서명 검증 로직
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    if (`v1=${expectedSignature}` !== signature) {
      console.log('Invalid signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }
  }

  // 웹훅 데이터 처리
  try {
    const data = body ? JSON.parse(body) : {};
    console.log('Notion webhook data:', data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};