export const getRoomKey = ({
  userId,
  friendId,
}: {
  userId: number | string;
  friendId: number | string;
}) => {
  return [+userId, +friendId].sort().join('-');
};
