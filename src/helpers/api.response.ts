export function api_response(params: { status: number; message: string }) {
  params['success'] = params?.status === 200 || params?.status === 201;
  return {
    ...params,
  };
}
