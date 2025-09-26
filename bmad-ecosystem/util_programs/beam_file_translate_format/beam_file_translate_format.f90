program beam_file_translate_format

use beam_file_io
use hdf5_interface
use bmad
use rad_6d_mod
use beam_utils

implicit none

type (beam_struct) beam
type (beam_init_struct) beam_init
type (lat_struct) lat
type (coord_struct), allocatable :: orbit(:)
type (normal_modes_struct) modes
type (ele_pointer_struct), allocatable :: eles(:)

real(rp) sigma_mat(6,6)
integer n_loc

logical err_flag
logical calculate_emit 

character(16) out_fmt
character(40) ele_name
character(200) beam_file, lat_file, full_name

namelist / param / lat_file, calculate_emit, ele_name, beam_init

!

call get_command_argument(1, beam_file)
call get_command_argument(2, out_fmt)
call get_command_argument(3, lat_file)

if (beam_file == '') then
  print '(a)', 'Usage:'
  print '(a)', '   beam_file_translate_format <beam_file> <out_format> <lat_file>'
  print '(a)', ' where:'
  print '(a)', '   <beam_file> is the name of the beamfile.'
  print '(a)', '   <lat_file> (optional) is the name of a lattice file which is possibly needed with hdf5 format input.'
  print '(a)', '   <out_format> (optional) Output format can be one of:'
  print '(a)', '     ascii      - ASCII format. Default if <beam_file> has ".h5" or ".hdf5" suffix.'
  print '(a)', '     hdf5       - HDF5 binary format. Default if <beam_file> does not have ".h5" or ".hdf5" suffix.'
  print '(a)', '     old_ascii  - Old ASCII format. Only to be used for testing.'
  print '(a)', '     old_binary - Old binary format. Only to be used for testing.'
  stop
endif

call fullfilename(beam_file, full_name)

if (index(beam_file, '.init') == len_trim(beam_file)-4 .and. len_trim(beam_file) > 5) then
  open (1, file = full_name, status = 'old')
  calculate_emit = .false.
  read (1, nml = param)
  close (1)
  call bmad_parser(lat_file, lat)
  call twiss_and_track(lat, orbit)
  call lat_ele_locator (ele_name, lat, eles, n_loc)
  if (calculate_emit) call emit_6d(lat%ele(0), .true., modes, sigma_mat)
  call init_beam_distribution(eles(1)%ele, lat%param, beam_init, beam, err_flag, modes)

elseif (lat_file == '') then
  call read_beam_file(beam_file, beam, beam_init, err_flag)

else
  call bmad_parser(lat_file, lat)
  call read_beam_file(beam_file, beam, beam_init, err_flag, lat%ele(0))
endif  

if (err_flag) stop

if (out_fmt == '') then
  if (index(beam_file, '.h5') == 0 .and. index(beam_file, '.hdf5') == 0) then
    out_fmt = 'hdf5'
  else
    out_fmt = 'ascii'
  endif
endif

select case (out_fmt)
case ('ascii')
  call file_suffixer(full_name, full_name, '.dat', .true.)
  call write_beam_file (full_name, beam, .true., ascii$)

case ('hdf5')
  call file_suffixer(full_name, full_name, '.hdf5', .true.)
  call write_beam_file (full_name, beam, .true., hdf5$)

case ('old_ascii')
  call file_suffixer(full_name, full_name, '.dat', .true.)
  call write_beam_file (full_name, beam, .true., old_ascii$)

case ('old_binary')
  call file_suffixer(full_name, full_name, '.bin', .true.)
  call write_beam_file (full_name, beam, .true., binary$)
end select

print '(a)', 'Written: ', trim(full_name)

end program
