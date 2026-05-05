import { query } from '$app/server';

function _getDate() {
  return Math.floor(Date.now() / 1000);
}

export const getDate = query(_getDate);