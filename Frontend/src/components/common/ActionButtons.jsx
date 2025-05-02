import React from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaPencilAlt, FaPlus } from 'react-icons/fa';
import ActionButton from './ActionButton';

/**
 * ActionButtons component that renders a group of action buttons based on permissions
 *
 * @param {Object} props
 * @param {Object} props.row - The data row for the current item
 * @param {Function} props.onView - View handler function
 * @param {Function} props.onEdit - Edit handler function
 * @param {Function} props.onAdd - Add handler function (optional)
 * @param {String} props.viewPermission - Permission required for view button
 * @param {String} props.editPermission - Permission required for edit button
 * @param {String} props.addPermission - Permission required for add button
 * @param {String} props.className - Additional CSS classes for the container
 */
const ActionButtons = ({
  row,
  onView,
  onEdit,
  onAdd,
  viewPermission,
  editPermission,
  addPermission,
  className
}) => {
  // Log permissions for debugging
  console.debug('ActionButtons permissions:', {
    viewPermission,
    editPermission,
    addPermission
  });

  return (
    <div className={`action-buttons ${className || ''}`}>
      {onView && (
        <ActionButton
          type="view"
          onClick={() => onView(row)}
          permission={viewPermission}
          icon={<FaEye />}
          title="View Details"
        />
      )}

      {onEdit && (
        <ActionButton
          type="edit"
          onClick={() => onEdit(row)}
          permission={editPermission}
          icon={<FaPencilAlt />}
          title="Edit"
        />
      )}



      {onAdd && (
        <ActionButton
          type="add"
          onClick={() => onAdd(row)}
          permission={addPermission}
          icon={<FaPlus />}
          title="Add"
        />
      )}
    </div>
  );
};

ActionButtons.propTypes = {
  row: PropTypes.object.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onAdd: PropTypes.func,
  viewPermission: PropTypes.string,
  editPermission: PropTypes.string,
  addPermission: PropTypes.string,
  className: PropTypes.string
};

export default ActionButtons;
